export class ConversationParticipant {
    constructor(data){
        this.Id = data.Id;
        this.IdConversation = data.IdConversation;
        this.Statut = data.Statut;
        this.Role = data.Role;
        this.JoinedAt = data.JoinedAt;
    }
}