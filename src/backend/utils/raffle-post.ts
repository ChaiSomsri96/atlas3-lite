import { ExtendedRaffle } from "@/frontend/hooks/useRunningRaffles";
import webhook from "webhook-discord";

export const rafflePost = async (
  raffle: ExtendedRaffle,
  webhookUrl: string,
  giveawayRoleId: string
) => {
  const name = raffle.name;
  const imageUrl = raffle.collabProject
    ? raffle.collabProject.imageUrl
    : raffle.bannerUrl
    ? raffle.bannerUrl
    : "";

  const msg = new webhook.MessageBuilder()
    .setName("Atlas3")
    .setText(
      `<@&${giveawayRoleId}> - A new raffle has just gone live on Atlas3!`
    )
    .setColor("#16a34a")
    .addField("", "")
    .setTitle(name)
    .addField(
      "Ticket Price",
      `${raffle.paymentTokenAmount} $${raffle.paymentToken?.tokenName}`
    )
    .addField("Total Winners", raffle.maxWinners.toString())
    .setThumbnail(imageUrl ? imageUrl : "")
    .addField("", "[**Buy Tickets on Atlas3**](https://atlas3.io/raffles)")
    .addField("", "")
    .setFooter(
      `Atlas3 | ${new Date().toUTCString()}`,
      "https://media.discordapp.net/attachments/1045293041000398868/1073229675779870810/Symbol-Final.png"
    );

  await new webhook.Webhook(webhookUrl).send(msg);
};
