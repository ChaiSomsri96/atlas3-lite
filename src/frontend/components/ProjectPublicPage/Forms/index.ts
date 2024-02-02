import dynamic from "next/dynamic";

const MintDetailsForm = dynamic(() => import("./MintDetailsForm"));
const ProjectDetailsForm = dynamic(() => import("./ProjectDetailsForm"));
const CommunitiesForm = dynamic(() => import("./CommunitiesForm"));
const GiveawayDetailsForm = dynamic(() => import("./GiveawayDetailsForm"));
const EntryRequirementsForm = dynamic(() => import("./EntryRequirementsForm"));

export {
  MintDetailsForm,
  ProjectDetailsForm,
  CommunitiesForm,
  GiveawayDetailsForm,
  EntryRequirementsForm,
};
