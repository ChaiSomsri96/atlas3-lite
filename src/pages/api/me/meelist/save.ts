import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/backend/lib/prisma";
import { ApplicationStatus, MeeListApplications } from "@prisma/client";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { unstable_getServerSession } from "next-auth";

type ResponseData = {
  application: MeeListApplications;
};

type ErrorData = {
  message: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData | ErrorData>
) {
  const session = await unstable_getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (req.method !== "PUT") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { answers } = JSON.parse(req.body);

  if (!answers) {
    return res.status(400).json({ message: "Missing answers" });
  }

  const application = await prisma.meeListApplications.findUnique({
    where: {
      userId: session.user.id,
    },
  });

  if (!application) {
    const createdApplication = await prisma.meeListApplications.create({
      data: {
        userId: session.user.id,
        answers: answers,
        followers: 0,
        twitterUsername: "",
        twitterImageUrl: "",
        twitterUserId: "",
        status: ApplicationStatus.DRAFT,
        submitSaved: false,
      },
    });

    return res.status(200).json({ application: createdApplication });
  }

  if (application) {
    // Check if the answer already exists
    let updatedAnswers = application.answers.map((existingAnswer) => {
      if (existingAnswer.question === answers[0].question) {
        // If it does, update it
        return answers[0];
      } else {
        // If not, keep the existing answer
        return existingAnswer;
      }
    });

    // If the answer does not exist, add it
    if (
      !updatedAnswers.find((answer) => answer.question === answers[0].question)
    ) {
      updatedAnswers = [...updatedAnswers, ...answers];
    }

    const modifiedUser = await prisma.meeListApplications.update({
      where: {
        userId: session.user.id,
      },
      data: {
        answers: updatedAnswers,
      },
    });

    return res.status(200).json({ application: modifiedUser });
  }
}
