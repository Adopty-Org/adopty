export class Utilisateur {
    /*constructor({
        Id,
        clerkId,
        stripeCustomerId,
        Nom,
        Prenom,
        Addresse,
        AddresseEmail,
        Wilaya,
        MotDePasse,
        Photo,
        CreeLe,
        CreePar,
        ModifieeLe,
        ModifieePar
    } = {}) {
        this.Id = Id;
        this.clerkId = clerkId;
        this.stripeCustomerId = stripeCustomerId;
        this.Nom = Nom;
        this.Prenom = Prenom;
        this.Addresse = Addresse;
        this.AddresseEmail = AddresseEmail;
        this.Wilaya = Wilaya;
        this.MotDePasse = MotDePasse;
        this.Photo = Photo;
        this.CreeLe = CreeLe;
        this.CreePar = CreePar;
        this.ModifieeLe = ModifieeLe;
        this.ModifieePar = ModifieePar;
    };*/

    constructor(data) {
    this.Id = data.Id;
    this.clerkId = data.clerkId;
    this.stripeCustomerId = data.stripeCustomerId;
    this.stripeAccountId = data.stripeAccountId;
    this.Nom = data.Nom;
    this.Prenom = data.Prenom;
    this.Addresse = data.Addresse;
    this.AddresseEmail = data.AddresseEmail;
    this.Wilaya = data.Wilaya;
    this.MotDePasse = data.MotDePasse;
    this.Photo = data.Photo;
    this.CreeLe = data.CreeLe;
    this.CreePar = data.CreePar;
    this.ModifieeLe = data.ModifieeLe;
    this.ModifieePar = data.ModifieePar;
    this.stripeAccountStatus = data.stripeAccountStatus;
  }
}