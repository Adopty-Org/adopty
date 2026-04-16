export class Conversation_participant {
    constructor(data){
        this.Id = data.Id;
        this.IdConversation = data.IdConversation;
        this.Statut = data.Statut;
        this.Role = data.Role;
        this.JoinedAt = data.JoinedAt;
    }
}