export const addRole = async (guildId: string, userId: string, roleId: string) => {
    const addRoleRes = await fetch(
      `https://discord.com/api/guilds/${guildId}/members/${userId}/roles/${roleId}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
        },
      }
    );
  
    const resText = await addRoleRes.text();
    if (resText) {
      return JSON.parse(resText);
    }
  };