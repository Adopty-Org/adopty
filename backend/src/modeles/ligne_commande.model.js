export class LigneCommande {
    constructor(data){
        this.Id = data.Id;
        this.IdSousCommande = data.IdSousCommande;
        this.IdProduit = data.IdProduit;
        this.Qantite = data.Qantite;
    }
}