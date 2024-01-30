import React from "react";
import { GridElement, Heading, SubHeading } from "./SharedFormElements";
import Dropzone from "react-dropzone";
import TextEditor from "../../TextEditor";
import { RequestCollab } from "@/shared/types";
import { useS3Upload } from "next-s3-upload";
import { useFormContext } from "react-hook-form";

function ProjectDetailsForm() {
  const { uploadToS3 } = useS3Upload();

  const { register, setValue } = useFormContext<RequestCollab>();

  const handleFileUpload = async (acceptedFiles: File[]) => {
    console.log(acceptedFiles[0].name);
    const { url } = await uploadToS3(acceptedFiles[0]);
    console.log("url", url);
    setValue("featuredBanner", url);
  };

  return (
    <>
      {/* ----------- Heading -------------------------*/}
      <Heading
        title="Project Details"
        description="Enter all your project details. The more accurate the description, the
        better chance to be approved by the other project."
      />
      {/* ----------- Sub heading -------------------------*/}
      <GridElement label="Project Name">
        <input
          className="text-sm leading-[17px] bg-neutral-800 mt-3 mb-[10px] h-11 border border-neutral-700 rounded-xl py-[14px] pl-4"
          placeholder="Input text here"
          {...register("projectName")}
        />
      </GridElement>
      {/* ----------- Featured Banner -------------------------*/}
      <SubHeading
        subHeading="Featured Banner"
        description="Recommended ratio: 3:1"
      />
      {/* Dropzone */}
      <Dropzone onDrop={(acceptedFiles) => handleFileUpload(acceptedFiles)}>
        {({ getRootProps, getInputProps }) => (
          <div {...getRootProps()} className="mt-3 mb-5">
            <input {...getInputProps()} {...register("featuredBanner")} />
            <div className="w-full h-[102px] bg-neutral-800 border border-neutral-700 rounded-xl flex justify-center items-center">
              <p className="text-neutral-50">Upload a file or drag and drop</p>
            </div>
          </div>
        )}
      </Dropzone>

      {/* ----------- Project Summary -------------------------*/}
      <SubHeading
        subHeading="Project Summary"
        description="This description appears when you share a link."
      />
      {/* TODO: Add textarea here */}
      <textarea
        className="w-full text-sm leading-[17px] bg-neutral-800 mt-3 mb-[10px] border border-neutral-700 rounded-xl py-[14px] pl-4 h-[102px]"
        placeholder="Input text here"
        {...register("projectSummary")}
      />
      {/* ----------- Project Description -------------------------*/}
      <SubHeading
        subHeading="Project Description"
        description="Write about your project goals, vision, team etc.. why would people be bullish on it."
      />

      {/* Rich Text Editor */}
      <TextEditor />
      <div className="grid grid-cols-2 col-span-2 gap-[10px]">
        <GridElement label="Project Twitter">
          <input
            className="text-sm leading-[17px] bg-neutral-800 mt-3 mb-[10px] h-11 border border-neutral-700 rounded-xl py-[14px] pl-4"
            placeholder="Input text here"
            {...register("projectTwitter")}
          />
        </GridElement>
        <GridElement label="Project Discord">
          <input
            className="text-sm leading-[17px] bg-neutral-800 mt-3 mb-[10px] h-11 border border-neutral-700 rounded-xl py-[14px] pl-4"
            placeholder="Input text here"
            {...register("projectDiscord")}
          />
        </GridElement>
        <GridElement label="Project Website">
          <input
            className="text-sm leading-[17px] bg-neutral-800 mt-3 mb-[10px] h-11 border border-neutral-700 rounded-xl py-[14px] pl-4"
            placeholder="Input text here"
            {...register("projectWebsite")}
          />
        </GridElement>
        <GridElement label="Contact Person">
          <input
            className="text-sm leading-[17px] bg-neutral-800 mt-3 mb-[10px] h-11 border border-neutral-700 rounded-xl py-[14px] pl-4"
            placeholder="Input text here"
            {...register("contactPerson")}
          />
        </GridElement>
      </div>
    </>
  );
}

export default ProjectDetailsForm;
