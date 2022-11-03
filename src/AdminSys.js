// ** Dependancies **

// n/a

// ** Functions & Classes **

class AdminUser {
    /**
     * 
     * @param {*} DiscordMember 
     */
    constructor(Guild, DiscordMember) {
        this.adminLevel = 1;
        this.id = DiscordMember.id;
        this.DiscordMember = DiscordMember;
        this.guild = Guild;
    }

    IsAdmin() {
        return true;
    }
}

class GuildAdminSystem {
    constructor(Guild) {
        this.AdminMembers = []; // type: AdminUser
        this.AllMembers = [];
        this.Guild = Guild;
    }

    /**
     * 
     * @param {AdminUser} query_member 
     * @returns 
     */
    IsAdmin(ID) {
        for (let i = 0; i < this.AdminMembers.length; i++) {
            const member = this.AdminMembers[i];
            if (member.id == ID) {
                return member.IsAdmin();
            }
        }
        return false;
    }

    MemberExists(ID) {
        for (let i = 0; i < this.AllMembers.length; i++) {
            const member = this.AllMembers[i];
            if (member.id == ID) {
                return true;
            }
        }
        return false;
    }

    AddMember(DiscordMember,IsAdmin) {
        if (this.MemberExists(DiscordMember.id)) {
            return;
        }
        if (IsAdmin) {
            let member = new AdminUser(this.Guild, DiscordMember);
            this.AdminMembers.push(member);
            console.log(this.AdminMembers);
        }
        this.AllMembers.push(DiscordMember);
    }

    RemoveMember(DiscordMember) {
        if (!this.MemberExists(DiscordMember.id)) return;
        for (let i = 0; i < this.AdminMembers.length; i++) {
            const member = this.AdminMembers[i];
            if (member.id == DiscordMember.id) {
                this.AdminMembers.splice(i,1);
                break;
            }
        }
        for (let i = 0; i < this.AllMembers.length; i++) {
            const member = this.AllMembers[i];
            if (member.id == DiscordMember.id) {
                this.AllMembers.splice(i,1);
                break;
            }
        }
    }
}

module.exports = { GuildAdminSystem };
