// ** Dependancies **

// n/a

// ** Functions & Classes **

class AdminUser {
    /**
     * 
     * @param {*} DiscordMember 
     */
    constructor(Guild, DiscordMember) {
        this.adminLevel = (this.IsAdmin(Guild, DiscordMember)) ? 1 : 0; // 1 = admin, 0 = non-admin
        this.id = DiscordMember.id;
        this.guild = Guild;
    }

    IsAdmin() {
        return false; // temp
    }
}

class GuildAdminSystem {
    constructor(Guild) {
        this.AdminMembers = []; // type: AdminUser
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
        for (let i = 0; i < this.AdminMembers.length; i++) {
            const member = this.AdminMembers[i];
            if (member.id == ID) {
                return true;
            }
        }
        return false;
    }

    AddMember(DiscordMember) {
        if (this.MemberExists(DiscordMember.id)) {
            return;
        }
        let member = new AdminUser(this.Guild, DiscordMember);
        this.AdminMembers.push(member);
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
    }
}

module.exports = { GuildAdminSystem };
