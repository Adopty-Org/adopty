export class ProfilPrestataire {
    constructor(data){
        this.Id = data.Id;
        this.IdUtilisateur = data.IdUtilisateur;
        this.Experience = data.Experience;
        this.TarifHoraire = data.TarifHoraire;
        this.ZoneIntervention = data.ZoneIntervention;
        this.TypeService = data.TypeService;
        this.Statut = data.Statut;
        this.Bio = data.Bio;
        this.NoteMoyenne = data.NoteMoyenne;
    }
}