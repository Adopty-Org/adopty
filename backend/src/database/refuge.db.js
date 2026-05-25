import { db } from "../config/db.js";
import { Animal } from "../modeles/animal.model.js";
import { Refuge } from "../modeles/refuge.model.js";

export const CreateRefuge = async (refuge) => {
    const [result] = await db.query(
        `INSERT INTO refuge (Nom,Description,Addresse,AddresseGPS,Date_inscription,Telephone,stripeAccountId,stripeAccountStatus)
        VALUES(?,?,?,?,NOW(),?,?,?)`,
        [
            refuge.Nom,
            refuge.Description,
            refuge.Addresse,
            refuge.AddresseGPS,
            
            refuge.Telephone,
            refuge.stripeAccountId,
            refuge.stripeAccountStatus
        ]
    );

    return result.insertId;
}

export const getAllRefuges = async () => {
  const [rows] = await db.query("SELECT * FROM refuge");
  return rows.map(row => new Refuge(row));
};

export const getRefugeById = async (id) => {
  const [rows] = await db.query(
    "SELECT * FROM refuge WHERE Id = ?",
    [id]
  );

  if (!rows[0]) return null;

  return new Refuge(rows[0]);
};

export const updateRefuge = async (id, refuge) => {
  const [result] = await db.query(
    `UPDATE refuge SET 
      Nom = ?,
      Description = ?,
      Addresse = ?,
      AddresseGPS = ?,
      
      Telephone = ?,
      stripeAccountId = ?,
      stripeAccountStatus = ?
     WHERE Id = ?`,
    [
      refuge.Nom,
      refuge.Description,
      refuge.Addresse,
      refuge.AddresseGPS,
      
      refuge.Telephone,
      refuge.stripeAccountId,
      refuge.stripeAccountStatus,
      id
    ]
  );

  return result.affectedRows;
};

export const deleteRefuge = async (id) => {
  const [result] = await db.query(
    "DELETE FROM refuge WHERE Id = ?",
    [id]
  );

  return result.affectedRows;
};

//
// requetes speciales
//

export const getRefugeAnimalsById = async (id) => {
  const [rows] = await db.query(
    `SELECT a.* FROM refuge r
     JOIN possession p ON r.Id = p.IdRefuge
     JOIN animal a ON p.IdAnimal = a.Id
     WHERE r.Id = ? AND p.IdUtilisateur IS NULL`,  //    <= c'est sous condition todo:(a surveiller)
     [
      id
     ]
  );

  return rows.map(row =>new Animal(row));
}

 //   todo : check les deux funcs juste en bas car pas fini 

export const addAnimalToRefugeByIds = async (animalId, refugeId) => {
    const [result] = await db.query(
        `INSERT INTO possession (IdAnimal,IdUtilisateur,IdRefuge)
        VALUES(?, NULL, ?)`,
        [
            animalId,
            refugeId
        ]
    );

    return result.insertId;
}

export const removeAnimalFromRefugeByIds = async (animalId, refugeId) => {
    const [result] = await db.query(
        `DELETE FROM possession 
        WHERE IdAnimal =? AND IdRefuge = ?`,
        [
            animalId,
            refugeId
        ]
    );

    return result.affectedRows;
}

export const setAnimalToRefugeByIds = async (animalId, refugeId) => {
    const [result] = await db.query(
        `UPDATE possession SET
         IdRefuge = ?
        WHERE IdAnimal =? AND IdRefuge IS NULL AND IdUtilisateur IS NULL`,
        [
            refugeId,
            animalId,
        ]
    );

    return result.affectedRows;
}

export const unsetAnimalToRefugeByIds = async (animalId, refugeId) => {
    const [result] = await db.query(
        `UPDATE possession SET
         IdRefuge = NULL
        WHERE IdAnimal =? AND IdRefuge = ? AND IdUtilisateur IS NOT NULL`,   //    <= todo:(a voir si ca fonctionne)
        [
            animalId,
            refugeId
        ]
    );

    return result.affectedRows;
}



// Transfert d'un refuge vers un utilisateur
export const transferRefugeToUser = async (animalId, refugeId, userId) => {
    const connection = await db.getConnection();
    
    try {
        await connection.beginTransaction();
        
        // 1. Vérifier que l'animal est bien au refuge
        const [checkRefuge] = await connection.query(
            `SELECT IdAnimal FROM possession 
             WHERE IdAnimal = ? AND IdRefuge = ? AND IdUtilisateur IS NULL`,
            [animalId, refugeId]
        );
        
        if (checkRefuge.length === 0) {
            throw new Error("L'animal n'est pas dans ce refuge");
        }
        
        // 2. Enlever l'animal du refuge
        const [unsetRefuge] = await connection.query(
            `UPDATE possession SET 
             IdRefuge = NULL
            WHERE IdAnimal = ? AND IdRefuge = ? AND IdUtilisateur IS NULL`,
            [animalId, refugeId]
        );
        
        if (unsetRefuge.affectedRows === 0) {
            throw new Error("Erreur lors du retrait de l'animal du refuge");
        }
        
        // 3. Attribuer l'animal à l'utilisateur
        const [setUser] = await connection.query(
            `UPDATE possession SET 
             IdUtilisateur = ?
            WHERE IdAnimal = ? AND IdUtilisateur IS NULL AND IdRefuge IS NULL`,
            [userId, animalId]
        );
        
        if (setUser.affectedRows === 0) {
            throw new Error("Erreur lors de l'attribution à l'utilisateur");
        }
        
        await connection.commit();
        
        return {
            success: true,
            message: "Animal transféré avec succès du refuge vers l'utilisateur",
            animalId,
            from: { type: "refuge", id: refugeId },
            to: { type: "user", id: userId }
        };
        
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

// ==================== TRANSFERT ENTRE DEUX REFUGES ====================

// Version 1: Transfert simple entre deux refuges
export const transferBetweenRefuges = async (animalId, fromRefugeId, toRefugeId) => {
    const connection = await db.getConnection();
    
    try {
        await connection.beginTransaction();
        
        // 1. Vérifier que l'animal est bien dans le refuge source
        const [checkSource] = await connection.query(
            `SELECT IdAnimal FROM possession 
             WHERE IdAnimal = ?              AND IdRefuge = ? 
             AND IdUtilisateur IS NULL`,
            [animalId, fromRefugeId]
        );
        
        if (checkSource.length === 0) {
            throw new Error(`L'animal ${animalId} n'est pas dans le refuge ${fromRefugeId}`);
        }
        
        // 2. Vérifier que le refuge destination existe (optionnel)
        const [checkDestRefuge] = await connection.query(
            `SELECT IdRefuge FROM refuges WHERE IdRefuge = ?`,
            [toRefugeId]
        );
        
        if (checkDestRefuge.length === 0) {
            throw new Error(`Le refuge destination ${toRefugeId} n'existe pas`);
        }
        
        // 3. Transférer l'animal vers le nouveau refuge
        const [result] = await connection.query(
            `UPDATE possession SET 
             IdRefuge = ?
            WHERE IdAnimal = ? 
            AND IdRefuge = ? 
            AND IdUtilisateur IS NULL`,
            [toRefugeId, animalId, fromRefugeId]
        );
        
        if (result.affectedRows === 0) {
            throw new Error("Erreur lors du transfert entre refuges");
        }
        
        // 4. Optionnel: Enregistrer l'historique du transfert
        await connection.query(
            `INSERT INTO historique_transferts (IdAnimal, FromRefuge, ToRefuge, DateTransfert)
             VALUES (?, ?, ?, NOW())`,
            [animalId, fromRefugeId, toRefugeId]
        );
        
        await connection.commit();
        
        return {
            success: true,
            message: `Animal ${animalId} transféré avec succès du refuge ${fromRefugeId} vers le refuge ${toRefugeId}`,
            animalId,
            fromRefuge: fromRefugeId,
            toRefuge: toRefugeId,
            dateTransfert: new Date()
        };
        
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};