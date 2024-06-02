import {
  Control,
  useFieldArray,
  useForm,
  UseFormRegister,
} from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import {
  GiveawayInput,
  useHandleCreateGiveaway,
} from "@/frontend/handlers/useHandleCreateGiveaway";
import { useRouter } from "next/router";
import {
  AllowlistType,
  BlockchainNetwork,
  CollabType,
  DiscordRoleRuleType,
  GiveawayRuleType,
  GiveawayType,
  NftTokenType,
  ProjectPhase,
  TwitterActionType,
  TwitterFriendshipRuleType,
} from "@prisma/client";
import { RxPlus } from "react-icons/rx";
import { Fragment, useEffect, useState } from "react";
import PublicLayout from "@/frontend/components/Layout/PublicLayout";
import { ExtendedGiveaway } from "@/frontend/hooks/useGiveaway";
import { Loader } from "@/frontend/components/Loader";
import toast from "react-hot-toast";
import { SearchCollabProjects } from "@/frontend/components/SearchCollabProjects";
import { useCollabProjects } from "@/frontend/hooks/useCollabProjects";
import { useProject } from "@/frontend/hooks/useProject";
import { Dialog, Transition } from "@headlessui/react";
import { CloseSquare } from "iconsax-react";

const TwitterFriendshipRuleInput = ({
  register,
  errors,
  ruleIndex,
  // control,
  removeRule,
}: {
  register: UseFormRegister<GiveawayInput>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  errors: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control?: Control<GiveawayInput, any>;
  ruleIndex: number;
  removeRule: (ruleIndex: number) => void;
}) => {
  return (
    <div className="space-y-4 sm:space-y-3 p-3 bg-dark-600 rounded-lg">
      <div className="flex justify-between">
        <p>Rule {ruleIndex + 1}: Twitter Friendship Rule</p>

        <button
          type="button"
          className="text-red-500 hover:text-red-600 text-sm font-medium"
          onClick={() => removeRule(ruleIndex)}
        >
          Remove Rule
        </button>
      </div>
      <div>
        <div className="flex justify-between items-center">
          <label className="block text-sm font-medium mb-2 dark:text-white">
            Username
          </label>
          <span className="block text-sm text-gray-500 mb-2">Required</span>
        </div>
        <input
          type="text"
          id={`rules[${ruleIndex}].twitterFriendshipRule.username`}
          {...register(`rules.${ruleIndex}.twitterFriendshipRule.username`)}
          placeholder="Placeholder"
          className={`form-input w-full rounded-md text-sm bg-gray-800 border-gray-700 text-gray-400 ${
            errors?.rules?.[ruleIndex]?.twitterFriendshipRule?.username
              ? "border-red-500"
              : ""
          }`}
        />
        {errors?.rules?.[ruleIndex]?.twitterFriendshipRule?.username && (
          <p className="mt-2 text-sm text-red-600">
            {
              errors?.rules?.[ruleIndex]?.twitterFriendshipRule?.username
                ?.message
            }
          </p>
        )}
      </div>
      <div>
        <div className="flex justify-between items-center">
          <label className="block text-sm font-medium mb-2 dark:text-white">
            Relationship
          </label>
          <span className="block text-sm text-gray-500 mb-2">Required</span>
        </div>
        <select
          id={`rules[${ruleIndex}].twitterFriendshipRule.0.relationships`}
          {...register(
            `rules.${ruleIndex}.twitterFriendshipRule.relationships`
          )}
          className={`form-input w-full rounded-md text-sm bg-gray-800 border-gray-700 text-gray-400 ${
            errors?.rules?.[ruleIndex]?.twitterFriendshipRule?.relationships
              ? "border-red-500"
              : ""
          }`}
        >
          {Object.values(TwitterFriendshipRuleType).map((type) => (
            <option key={type} value={type}>
              <>
                {
                  {
                    [TwitterFriendshipRuleType.FOLLOW]: "Follow",
                    [TwitterFriendshipRuleType.FOLLOWED_BY]: "Following",
                    [TwitterFriendshipRuleType.NOTIFICATIONS_ON]:
                      "Notifications on",
                  }[type]
                }
              </>
            </option>
          ))}
        </select>

        {errors?.rules?.[ruleIndex]?.twitterFriendshipRule?.relationships && (
          <p className="mt-2 text-sm text-red-600">
            {
              errors?.rules?.[ruleIndex]?.twitterFriendshipRule?.relationships
                ?.message
            }
          </p>
        )}
      </div>
    </div>
  );
};

const TwitterTweetRuleInput = ({
  register,
  errors,
  ruleIndex,
  // control,
  removeRule,
}: {
  register: UseFormRegister<GiveawayInput>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  errors: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control?: Control<GiveawayInput, any>;
  ruleIndex: number;
  removeRule: (ruleIndex: number) => void;
}) => {
  return (
    <div className="space-y-4 sm:space-y-3 p-3 bg-dark-600 rounded-lg">
      <div className="flex justify-between">
        <p>Rule {ruleIndex + 1}: Tweet Rule</p>

        <button
          type="button"
          className="text-red-500 hover:text-red-600 text-sm font-medium"
          onClick={() => removeRule(ruleIndex)}
        >
          Remove Rule
        </button>
      </div>
      <div>
        <div className="flex justify-between items-center">
          <label className="block text-sm font-medium mb-2 dark:text-white">
            Tweet ID
          </label>
          <span className="block text-sm text-gray-500 mb-2">Required</span>
        </div>
        <input
          type="text"
          id={`rules[${ruleIndex}].twitterTweetRule.tweetId`}
          {...register(`rules.${ruleIndex}.twitterTweetRule.tweetId`)}
          placeholder="Placeholder"
          className={`form-input w-full rounded-md text-sm bg-gray-800 border-gray-700 text-gray-400 ${
            errors?.rules?.[ruleIndex]?.twitterTweetRule.tweetId
              ? "border-red-500"
              : ""
          }`}
        />
        {errors?.rules?.[ruleIndex]?.twitterTweetRule.tweetId && (
          <p className="mt-2 text-sm text-red-600">
            {errors?.rules?.[ruleIndex]?.twitterTweetRule.tweetId?.message}
          </p>
        )}
      </div>
      <div>
        <div className="flex justify-between items-center">
          <label className="block text-sm font-medium mb-2 dark:text-white">
            Action
          </label>
          <span className="block text-sm text-gray-500 mb-2">Required</span>
        </div>
        <select
          id={`rules[${ruleIndex}].twitterTweetRule.actions`}
          {...register(`rules.${ruleIndex}.twitterTweetRule.actions`)}
          className={`form-input w-full rounded-md text-sm bg-gray-800 border-gray-700 text-gray-400 ${
            errors?.rules?.[ruleIndex]?.twitterTweetRule.actions
              ? "border-red-500"
              : ""
          }`}
        >
          {Object.values(TwitterActionType).map((type) => (
            <option key={type} value={type}>
              <>
                {
                  {
                    [TwitterActionType.RETWEET]: "Retweet",
                    [TwitterActionType.LIKE]: "Like",
                    [TwitterActionType.QUOTE]: "Quote Tweet",
                  }[type]
                }
              </>
            </option>
          ))}
        </select>

        {errors?.rules?.[ruleIndex]?.twitterTweetRule.actions && (
          <p className="mt-2 text-sm text-red-600">
            {errors?.rules?.[ruleIndex]?.twitterTweetRule.actions?.message}
          </p>
        )}
      </div>
    </div>
  );
};

const DiscordGuildRuleInput = ({
  register,
  errors,
  ruleIndex,
  // control,
  removeRule,
}: {
  register: UseFormRegister<GiveawayInput>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  errors: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control?: Control<GiveawayInput, any>;
  ruleIndex: number;
  removeRule: (ruleIndex: number) => void;
}) => {
  return (
    <div className="space-y-4 sm:space-y-3 p-3 bg-dark-600 rounded-lg">
      <div className="flex justify-between">
        <p>Rule {ruleIndex + 1}: Discord Server Rule</p>

        <button
          type="button"
          className="text-red-500 hover:text-red-600 text-sm font-medium"
          onClick={() => removeRule(ruleIndex)}
        >
          Remove Rule
        </button>
      </div>
      <div>
        <div className="flex justify-between items-center">
          <label className="block text-sm font-medium mb-2 dark:text-white">
            Discord Server ID
          </label>
          <span className="block text-sm text-gray-500 mb-2">Required</span>
        </div>
        <input
          type="number"
          onWheel={() => {
            if (document.activeElement instanceof HTMLElement) {
              document?.activeElement?.blur();
            }
          }}
          required={true}
          id={`rules[${ruleIndex}].discordGuildRule.guildId`}
          {...register(`rules.${ruleIndex}.discordGuildRule.guildId`)}
          placeholder="Placeholder"
          className={`form-input w-full rounded-md text-sm bg-gray-800 border-gray-700 text-gray-400 ${
            errors?.rules?.[ruleIndex]?.discordGuildRule.guildId
              ? "border-red-500"
              : ""
          }`}
        />
        {errors?.rules?.[ruleIndex]?.discordGuildRule.guildId && (
          <p className="mt-2 text-sm text-red-600">
            {errors?.rules?.[ruleIndex]?.discordGuildRule.guildId?.message}
          </p>
        )}
      </div>
      <div>
        <div className="flex justify-between items-center">
          <label className="block text-sm font-medium mb-2 dark:text-white">
            Discord Server Name
          </label>
          <span className="block text-sm text-gray-500 mb-2">Required</span>
        </div>
        <input
          type="text"
          required={true}
          id={`rules[${ruleIndex}].discordGuildRule.guildName`}
          {...register(`rules.${ruleIndex}.discordGuildRule.guildName`)}
          placeholder="Placeholder"
          className={`form-input w-full rounded-md text-sm bg-gray-800 border-gray-700 text-gray-400 ${
            errors?.rules?.[ruleIndex]?.discordGuildRule.guildName
              ? "border-red-500"
              : ""
          }`}
        />

        {errors?.rules?.[ruleIndex]?.discordGuildRule.guildName && (
          <p className="mt-2 text-sm text-red-600">
            {errors?.rules?.[ruleIndex]?.discordGuildRule.guildName?.message}
          </p>
        )}
      </div>
      <div>
        <div className="flex justify-between items-center">
          <label className="block text-sm font-medium mb-2 dark:text-white">
            Discord Invite URL
          </label>
          <span className="block text-sm text-gray-500 mb-2">
            Optional (consider using this for public giveaways){" "}
          </span>
        </div>
        <input
          type="text"
          id={`rules[${ruleIndex}].discordGuildRule.guildInvite`}
          {...register(`rules.${ruleIndex}.discordGuildRule.guildInvite`)}
          placeholder="Placeholder"
          className={`form-input w-full rounded-md text-sm bg-gray-800 border-gray-700 text-gray-400 ${
            errors?.rules?.[ruleIndex]?.discordGuildRule.guildInvite
              ? "border-red-500"
              : ""
          }`}
        />

        {errors?.rules?.[ruleIndex]?.discordGuildRule.guildInvite && (
          <p className="mt-2 text-sm text-red-600">
            {errors?.rules?.[ruleIndex]?.discordGuildRule.guildInvite?.message}
          </p>
        )}
      </div>
    </div>
  );
};

const DiscordRoleRuleInput = ({
  register,
  errors,
  ruleIndex,
  control,
  removeRule,
}: {
  register: UseFormRegister<GiveawayInput>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  errors: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<GiveawayInput, any>;
  ruleIndex: number;
  removeRule: (ruleIndex: number) => void;
}) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `rules.${ruleIndex}.discordRoleRule.roles`,
  });

  return (
    <div className="space-y-4 sm:space-y-3 p-3 bg-dark-600 rounded-lg">
      <div className="flex justify-between">
        {/* TODO: Add rule logic*/}
        <p>Rule {ruleIndex + 1}: Discord Role Rule </p>

        <button
          type="button"
          className="text-red-500 hover:text-red-600 text-sm font-medium"
          onClick={() => removeRule(ruleIndex)}
        >
          Remove Rule
        </button>
      </div>

      <p className="text-sm">
        User should have one of the following roles in the given discord server.
      </p>
      <div>
        <div className="flex justify-between items-center">
          <label className="block text-sm font-medium mb-2 dark:text-white">
            Discord Server ID
          </label>
          <span className="block text-sm text-gray-500 mb-2">Required</span>
        </div>
        <input
          type="number"
          onWheel={() => {
            if (document.activeElement instanceof HTMLElement) {
              document?.activeElement?.blur();
            }
          }}
          required={true}
          id={`rules[${ruleIndex}].discordRoleRule.guildId`}
          {...register(`rules.${ruleIndex}.discordRoleRule.guildId`, {
            required: "Required",
          })}
          placeholder="Placeholder"
          className={`form-input w-full rounded-md text-sm bg-gray-800 border-gray-700 text-gray-400 ${
            errors?.rules?.[ruleIndex]?.discordRoleRule.guildId
              ? "border-red-500"
              : ""
          }`}
        />
        {errors?.rules?.[ruleIndex]?.discordRoleRule.guildId && (
          <p className="mt-2 text-sm text-red-600">
            {errors?.rules?.[ruleIndex]?.discordRoleRule.guildId?.message}
          </p>
        )}
      </div>
      <div>
        <div className="flex justify-between items-center">
          <label className="block text-sm font-medium mb-2 dark:text-white">
            Discord Server Name
          </label>
          <span className="block text-sm text-gray-500 mb-2">Required</span>
        </div>
        <input
          type="text"
          required={true}
          id={`rules[${ruleIndex}].discordRoleRule.guildName`}
          {...register(`rules.${ruleIndex}.discordRoleRule.guildName`, {
            required: "Required",
          })}
          placeholder="Placeholder"
          className={`form-input w-full rounded-md text-sm bg-gray-800 border-gray-700 text-gray-400 ${
            errors?.rules?.[ruleIndex]?.discordRoleRule.guildName
              ? "border-red-500"
              : ""
          }`}
        />
        {errors?.rules?.[ruleIndex]?.discordRoleRule.guildName && (
          <p className="mt-2 text-sm text-red-600">
            {errors?.rules?.[ruleIndex]?.discordRoleRule.guildName?.message}
          </p>
        )}
      </div>

      <div>
        {fields.map((field, index) => (
          <div key={field.id} className="bg-gray-600 p-2 rounded-lg mt-2">
            <div className="flex justify-between">
              <p className="text-gray-300">Role {index + 1}</p>
              {index !== 0 && (
                <button
                  type="button"
                  className="text-red-500 hover:text-red-600 text-sm font-medium"
                  onClick={() => remove(index)}
                >
                  Remove
                </button>
              )}
            </div>
            <div>
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium mb-2 dark:text-white">
                  Role ID
                </label>
                <span className="block text-sm text-gray-500 mb-2">
                  Required
                </span>
              </div>
              <input
                type="number"
                onWheel={() => {
                  if (document.activeElement instanceof HTMLElement) {
                    document?.activeElement?.blur();
                  }
                }}
                required={true}
                id={`rules[${ruleIndex}].discordRoleRule.roles[${index}].id`}
                {...register(
                  `rules.${ruleIndex}.discordRoleRule.roles.${index}.role.id`,
                  {
                    required: "Required",
                  }
                )}
                placeholder="Placeholder"
                className={`form-input w-full rounded-md text-sm bg-gray-800 border-gray-700 text-gray-400 ${
                  errors?.rules?.[ruleIndex]?.discordRoleRule.roles?.[index]?.id
                    ? "border-red-500"
                    : ""
                }`}
              />
              {errors?.rules?.[ruleIndex]?.discordRoleRule.roles?.[index]
                ?.id && (
                <p className="mt-2 text-sm text-red-600">
                  {
                    errors?.rules?.[ruleIndex]?.discordRoleRule.roles?.[index]
                      ?.id?.message
                  }
                </p>
              )}
            </div>

            <div className="mt-2">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium mb-2 dark:text-white">
                  Role Name
                </label>
                <span className="block text-sm text-gray-500 mb-2">
                  Required
                </span>
              </div>
              <input
                type="text"
                required={true}
                id={`rules[${ruleIndex}].discordRoleRule.roles[${index}].name`}
                {...register(
                  `rules.${ruleIndex}.discordRoleRule.roles.${index}.role.name`,
                  {
                    required: "Required",
                  }
                )}
                placeholder="Placeholder"
                className={`form-input w-full rounded-md text-sm bg-gray-800 border-gray-700 text-gray-400 ${
                  errors?.rules?.[ruleIndex]?.discordRoleRule.roles?.[index]
                    ?.name
                    ? "border-red-500"
                    : ""
                }`}
              />
              {errors?.rules?.[ruleIndex]?.discordRoleRule.roles?.[index]
                ?.name && (
                <p className="mt-2 text-sm text-red-600">
                  {
                    errors?.rules?.[ruleIndex]?.discordRoleRule.roles?.[index]
                      ?.name?.message
                  }
                </p>
              )}
            </div>

            <div className="mt-2">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium mb-2 dark:text-white">
                  Role Ticket Multiplier
                </label>
                <span className="block text-sm text-gray-500 mb-2">
                  Required
                </span>
              </div>
              <span className="block text-sm text-white">
                If user has this role, their entry into the raffle will be
                multiplied by this number.
              </span>
              <input
                type="text"
                id={`rules[${ruleIndex}].discordRoleRule.roles[${index}].multiplier`}
                {...register(
                  `rules.${ruleIndex}.discordRoleRule.roles.${index}.role.multiplier`,
                  {
                    valueAsNumber: true,
                  }
                )}
                placeholder="Placeholder"
                className={`form-input w-full rounded-md text-sm bg-gray-800 border-gray-700 text-gray-400 ${
                  errors?.rules?.[ruleIndex]?.discordRoleRule.roles?.[index]
                    ?.multiplier
                    ? "border-red-500"
                    : ""
                }`}
              />
              {errors?.rules?.[ruleIndex]?.discordRoleRule.roles?.[index]
                ?.multiplier && (
                <p className="mt-2 text-sm text-red-600">
                  {
                    errors?.rules?.[ruleIndex]?.discordRoleRule.roles?.[index]
                      ?.multiplier?.message
                  }
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        className="text-blue-500 hover:text-blue-600 text-sm font-medium"
        onClick={() => {
          append({
            role: { id: "", name: "", multiplier: 1 },
            type: DiscordRoleRuleType.HAVE_ROLE,
          });
        }}
      >
        + Add Role
      </button>
      {/* <div>
        <div className="flex justify-between items-center">
          <label className="block text-sm font-medium mb-2 dark:text-white">
            Discord Server Name
          </label>
          <span className="block text-sm text-gray-500 mb-2">Required</span>
        </div>
        <input
          type="text"
          id={`rules[${ruleIndex}].discordRoleRule.roles.0.id`}
          {...register(`rules.${ruleIndex}.discordRoleRule.roles.0.name`)}
          placeholder="Placeholder"
          className={`form-input w-full rounded-md text-sm bg-gray-800 border-gray-700 text-gray-400 ${
            errors?.rules?.[ruleIndex]?.discordRoleRule.guildName
              ? "border-red-500"
              : ""
          }`}
        />

        {errors?.rules?.[ruleIndex]?.discordRoleRule.guildName && (
          <p className="mt-2 text-sm text-red-600">
            {errors?.rules?.[ruleIndex]?.discordRoleRule.guildName?.message}
          </p>
        )}
      </div> */}
    </div>
  );
};

const OwnNftInput = ({
  register,
  errors,
  ruleIndex,
  // control,
  removeRule,
}: {
  register: UseFormRegister<GiveawayInput>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  errors: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control?: Control<GiveawayInput, any>;
  ruleIndex: number;
  removeRule: (ruleIndex: number) => void;
}) => {
  return (
    <div className="space-y-4 sm:space-y-3 p-3 bg-dark-600 rounded-lg">
      <div className="flex justify-between">
        <p>Rule {ruleIndex + 1}: Own NFT</p>

        <button
          type="button"
          className="text-red-500 hover:text-red-600 text-sm font-medium"
          onClick={() => removeRule(ruleIndex)}
        >
          Remove Rule
        </button>
      </div>

      <div>
        <div className="flex justify-between items-center">
          <label className="block text-sm font-medium mb-2 dark:text-white">
            Network
          </label>
          <span className="block text-sm text-gray-500 mb-2">Required</span>
        </div>
        <select
          id={`rules[${ruleIndex}].ownNftRule.network`}
          {...register(`rules.${ruleIndex}.ownNftRule.network`)}
          className={`form-input w-full rounded-md text-sm bg-gray-800 border-gray-700 text-gray-400 ${
            errors?.rules?.[ruleIndex]?.ownNftRule.network
              ? "border-red-500"
              : ""
          }`}
        >
          {Object.values(BlockchainNetwork).map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>

        {errors?.rules?.[ruleIndex]?.ownNftRule.network && (
          <p className="mt-2 text-sm text-red-600">
            {errors?.rules?.[ruleIndex]?.ownNftRule.network?.message}
          </p>
        )}
      </div>

      <div>
        <div className="flex justify-between items-center">
          <label className="block text-sm font-medium mb-2 dark:text-white">
            Type
          </label>
          <span className="block text-sm text-gray-500 mb-2">Required</span>
        </div>
        <select
          id={`rules[${ruleIndex}].ownNftRule.type`}
          {...register(`rules.${ruleIndex}.ownNftRule.type`)}
          className={`form-input w-full rounded-md text-sm bg-gray-800 border-gray-700 text-gray-400 ${
            errors?.rules?.[ruleIndex]?.ownNftRule.type ? "border-red-500" : ""
          }`}
        >
          {Object.values(NftTokenType).map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>

        {errors?.rules?.[ruleIndex]?.ownNftRule.type && (
          <p className="mt-2 text-sm text-red-600">
            {errors?.rules?.[ruleIndex]?.ownNftRule.type?.message}
          </p>
        )}
      </div>

      <div>
        <div className="flex justify-between items-center">
          <label className="block text-sm font-medium mb-2 dark:text-white">
            First Creator Address or Verified Collection Address
          </label>
          <span className="block text-sm text-gray-500 mb-2">Required</span>
        </div>
        <input
          type="text"
          id={`rules[${ruleIndex}].minimumBalanceRule.minimumBalance`}
          {...register(
            `rules.${ruleIndex}.ownNftRule.collectionAddressOrContract`
          )}
          placeholder="Placeholder"
          className={`form-input w-full rounded-md text-sm bg-gray-800 border-gray-700 text-gray-400 ${
            errors?.rules?.[ruleIndex]?.ownNftRule.collectionAddressOrContract
              ? "border-red-500"
              : ""
          }`}
        />
        {errors?.rules?.[ruleIndex]?.ownNftRule.collectionAddressOrContract && (
          <p className="mt-2 text-sm text-red-600">
            {
              errors?.rules?.[ruleIndex]?.ownNftRule.collectionAddressOrContract
                ?.message
            }
          </p>
        )}
      </div>

      <div>
        <div className="flex justify-between items-center">
          <label className="block text-sm font-medium mb-2 dark:text-white">
            Collection Name
          </label>
          <span className="block text-sm text-gray-500 mb-2">Required</span>
        </div>
        <input
          type="text"
          id={`rules[${ruleIndex}].ownNftRule.collectionName`}
          {...register(`rules.${ruleIndex}.ownNftRule.collectionName`)}
          placeholder="Placeholder"
          className={`form-input w-full rounded-md text-sm bg-gray-800 border-gray-700 text-gray-400 ${
            errors?.rules?.[ruleIndex]?.ownNftRule.collectionName
              ? "border-red-500"
              : ""
          }`}
        />
        {errors?.rules?.[ruleIndex]?.ownNftRule.collectionName && (
          <p className="mt-2 text-sm text-red-600">
            {errors?.rules?.[ruleIndex]?.ownNftRule.collectionName?.message}
          </p>
        )}
      </div>
    </div>
  );
};

export function CreateOrEditGiveaway({
  giveaway,
  mode,
}: {
  giveaway?: ExtendedGiveaway;
  mode: "create" | "edit" | "duplicate";
}) {
  const handleCreateGiveaway = useHandleCreateGiveaway();
  const router = useRouter();
  const [selectedRuleType, setSelectedRuleType] = useState<GiveawayRuleType>(
    GiveawayRuleType.DISCORD_GUILD
  );

  const { projectSlug } = router.query;
  const { data: project, isLoading: projectLoading } = useProject({
    slug: projectSlug as string,
  });

  const [teamSpots, setTeamSpots] = useState(false);
  const [isConfirmOpen, setConfirmOpen] = useState<boolean>(false);
  const [formData, setFormData] = useState<GiveawayInput>();

  const validationSchema = Yup.object().shape({
    collabDuration: Yup.number()
      .required("Duration is required")
      .min(1, "Duration must be at least 1 hour"),
  });

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<GiveawayInput>({
    resolver: yupResolver(validationSchema),
  });

  const {
    fields: ruleFields,
    append,
    remove,
  } = useFieldArray<GiveawayInput>({
    control,
    name: "rules",
  });

  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);

  console.log(selectedProjects);

  useEffect(() => {
    if (giveaway) {
      reset({
        name: giveaway.name,
        maxWinners: giveaway.maxWinners,
        rules: giveaway.rules,
        endsAt: giveaway.endsAt
          ? new Date(giveaway.endsAt).toISOString().split(".")[0]
          : "",
        type: giveaway.type,
      });
    }
  }, []);

  const addNewRule = (type: GiveawayRuleType) => {
    console.log({
      type,
    });

    switch (type) {
      case GiveawayRuleType.DISCORD_GUILD:
        return append({
          type,
          discordGuildRule: {
            guildId: "",
            guildName: "",
            guildInvite: "",
          },
        });
      case GiveawayRuleType.DISCORD_ROLE:
        return append({
          type,
          discordRoleRule: {
            guildId: "",
            guildName: "",
            roles: [
              {
                role: {
                  id: "",
                  name: "",
                  multiplier: 1,
                },
                type: DiscordRoleRuleType.HAVE_ROLE,
              },
            ],
          },
        });

      case GiveawayRuleType.TWITTER_FRIENDSHIP:
        return append({
          type,
          twitterFriendshipRule: {
            relationships: [TwitterFriendshipRuleType.FOLLOW],
            username: "",
          },
        });

      case GiveawayRuleType.TWITTER_TWEET:
        return append({
          type,
          twitterTweetRule: {
            actions: [TwitterActionType.LIKE],
            tweetId: "",
          },
        });

      // case GiveawayRuleType.MINIMUM_BALANCE:
      // return append({
      //   type,
      //   minimumBalanceRule: {
      //     minimumBalance: 0,
      //     network: BlockchainNetwork.Solana,
      //     tokenAddress: "0x0",
      //   },
      // });

      case GiveawayRuleType.OWN_NFT:
        return append({
          type,
          ownNftRule: {
            type: NftTokenType.SPL,
            network: BlockchainNetwork.Ethereum,
            collectionAddressOrContract: "0x0",
            collectionName: "",
          },
        });

      default:
        return;
    }
  };

  const removeRule = (ruleIndex: number) => {
    console.log("remove rule");
    remove(ruleIndex);
  };

  const submitForm = (data: GiveawayInput | undefined) => {
    if (data) {
      for (const rule of data.rules) {
        if (rule.type === GiveawayRuleType.TWITTER_FRIENDSHIP) {
          const twitterUsername = rule.twitterFriendshipRule?.username;
          if (twitterUsername?.includes("@") && rule.twitterFriendshipRule) {
            rule.twitterFriendshipRule.username = twitterUsername.replace(
              "@",
              ""
            );
          }

          if (rule.twitterFriendshipRule?.username?.includes("twitter.com")) {
            const url = new URL(rule.twitterFriendshipRule.username);
            rule.twitterFriendshipRule.username = url.pathname.replace("/", "");
          }
        }

        if (rule.type === GiveawayRuleType.DISCORD_GUILD) {
          if (
            !rule.discordGuildRule?.guildId ||
            !rule.discordGuildRule?.guildName ||
            !rule.discordGuildRule?.guildInvite
          ) {
            return toast.error(
              "Please fill out all fields for Discord Guild Rule"
            );
          }
        }

        if (rule.type === GiveawayRuleType.DISCORD_ROLE) {
          if (
            !rule.discordRoleRule?.guildId ||
            !rule.discordRoleRule?.guildName
          ) {
            return toast.error(
              "Please fill out all fields for Discord Role Rule"
            );
          }
          for (const role of rule.discordRoleRule.roles) {
            if (!role.role.id || !role.role.name) {
              return toast.error(
                "Please fill out all fields for Discord Role Rule"
              );
            }
          }
        }
      }

      handleCreateGiveaway.mutate({
        id: mode === "edit" ? giveaway?.id : undefined,
        ...data,
        projectSlug: projectSlug as string,
      });
    }
  };

  const onSubmit = (data: GiveawayInput) => {
    data.collabProjectIds = selectedProjects;
    setFormData(data);
    if (!project?.discordGuild && collabType === CollabType.RECEIVE_SPOTS) {
      setConfirmOpen(true);
    } else {
      submitForm(data);
    }
  };

  const [search, setSearchValue] = useState<string>("");

  const { data: allProjects } = useCollabProjects({
    page: 1,
    pageLength: 1000,
    search: search,
    sortOption: "",
    filterOptions: "",
    notMine: false,
  });

  const collabType = watch("collabType");

  useEffect(() => {
    if (collabType === CollabType.GIVE_SPOTS) {
      if ((project?.defaultRules?.length ?? 0) > 0) {
        setValue("rules", project?.defaultRules ?? []);
      }
    } else if (collabType === CollabType.RECEIVE_SPOTS) {
      setValue("rules", []);
    }
  }, [collabType]);

  if (projectLoading) {
    return <Loader />;
  }

  if (collabType === CollabType.RECEIVE_SPOTS && !project?.verified) {
    return (
      <div className="flex flex-col gap-5 text-error-500">
        <div>
          You must be a verified project to request spots. In order to get
          verified, make sure your twitter is linked to your project through the{" "}
          <a
            className="underline text-primary-400"
            href={`/creator/project/${project?.slug}/socials`}
            target="_blank"
            rel="noreferrer"
          >
            socials page.
          </a>
        </div>

        <div>
          Once you have linked your twitter, an admin will verify it shortly.
        </div>

        <div>
          If you do not have access to the Twitter account you wish to link to
          your Atlas3 profile, raise a ticket in our{" "}
          <a
            className="underline text-primary-400"
            href={`https://discord.gg/blocksmithlabs`}
            target="_blank"
            rel="noreferrer"
          >
            discord
          </a>{" "}
          requesting manual verification. Otherwise please standby for the
          verification.
        </div>
      </div>
    );
  }

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-4 sm:space-y-3">
          <div>
            <div className="flex justify-between items-center">
              <label className="block text-sm font-medium mb-2 dark:text-white">
                Collab Type
              </label>
              <span className="block text-sm text-gray-500 mb-2">Required</span>
            </div>

            <select
              id="type"
              {...register("collabType", {
                required: "Project is required",
              })}
              className={`form-select w-full rounded-md text-sm bg-gray-800 border-gray-700 text-gray-400 ${
                errors.collabType ? "border-red-500" : ""
              }`}
              defaultValue={undefined}
            >
              <option value={undefined}>Select One</option>
              {project?.phase === ProjectPhase.POSTMINT ? (
                <option value={CollabType.RECEIVE_SPOTS}>
                  Request Allowlist Spots
                </option>
              ) : (
                <>
                  {Object.values(CollabType).map((type) => (
                    <option value={type} key={type}>
                      {
                        {
                          [CollabType.GIVE_SPOTS]: "Give Allowlist Spots",
                          [CollabType.RECEIVE_SPOTS]: "Request Allowlist Spots",
                        }[type]
                      }
                    </option>
                  ))}
                </>
              )}
            </select>

            {errors.collabType && (
              <p className="text-red-500 text-xs mt-1">
                {errors.collabType.message}
              </p>
            )}
          </div>
          {/* Select project */}
          <div>
            <div className="flex justify-between items-center">
              <label className="block text-sm font-medium mb-2 dark:text-white">
                Collab Project
              </label>
              <span className="block text-sm text-gray-500 mb-2">Required</span>
            </div>

            <SearchCollabProjects
              allProjects={allProjects}
              projectSlug={projectSlug as string}
              collabType={collabType}
              setValue={setSelectedProjects}
              setSearchValue={setSearchValue}
            />
          </div>
          <div>
            <div className="flex justify-between items-center">
              <label className="block text-sm font-medium mb-2 dark:text-white">
                Winners Count
              </label>
              <span className="block text-sm text-gray-500 mb-2">Required</span>
            </div>
            <input
              type="number"
              onWheel={() => {
                if (document.activeElement instanceof HTMLElement) {
                  document?.activeElement?.blur();
                }
              }}
              id="maxWinners"
              {...register("maxWinners", {
                valueAsNumber: true,
              })}
              placeholder="Placeholder"
              className={`form-input w-full rounded-md text-sm bg-gray-800 border-gray-700 text-gray-400 ${
                errors.maxWinners ? "border-red-500" : ""
              }`}
            />

            {errors.maxWinners && (
              <p className="text-red-500 text-xs mt-1">
                {errors.maxWinners.message}
              </p>
            )}
          </div>
          <div>
            <div className="flex justify-between items-center">
              <label className="block text-sm font-medium mb-2 dark:text-white">
                Type
              </label>
              <span className="block text-sm text-gray-500 mb-2">Required</span>
            </div>

            <select
              id="type"
              {...register("type")}
              className={`form-select w-full rounded-md text-sm bg-gray-800 border-gray-700 text-gray-400 ${
                errors.type ? "border-red-500" : ""
              }`}
            >
              {Object.values(GiveawayType)
                .filter((x) => x !== GiveawayType.MANUAL)
                .map((type) => (
                  <option key={type} value={type}>
                    <>
                      {
                        {
                          [GiveawayType.RAFFLE]: "Raffle",
                          [GiveawayType.FCFS]: "First Come First Serve",
                          [GiveawayType.MANUAL]: "Manual Selection",
                        }[type]
                      }
                    </>
                  </option>
                ))}
            </select>

            {errors.type && (
              <p className="text-red-500 text-xs mt-1">{errors.type.message}</p>
            )}
          </div>
          {collabType === CollabType.GIVE_SPOTS && (
            <div>
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium mb-2 dark:text-white">
                  Request Deadline (Local Time)
                </label>
                <span className="block text-sm text-gray-500 mb-2">
                  Required
                </span>
              </div>
              <input
                type="datetime-local"
                id="name"
                {...register("collabRequestDeadline", {
                  valueAsDate: true,
                })}
                placeholder="Placeholder"
                className={`input[type='datetime'] w-full rounded-md text-sm bg-gray-800 border-gray-700 text-gray-400 ${
                  errors.collabRequestDeadline ? "border-red-500" : ""
                }`}
              />

              {errors.collabRequestDeadline && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.collabRequestDeadline.message}
                </p>
              )}
            </div>
          )}
          <div>
            <div className="flex justify-between items-center">
              <label className="block text-sm font-medium mb-2 dark:text-white">
                Giveaway Duration (Hours)
              </label>
              <span className="block text-sm text-gray-500 mb-2">Required</span>
            </div>
            <input
              type="number"
              onWheel={() => {
                if (document.activeElement instanceof HTMLElement) {
                  document?.activeElement?.blur();
                }
              }}
              id="collabDuration"
              {...register("collabDuration", {
                valueAsNumber: true,
              })}
              placeholder="Placeholder"
              className={`input[type='datetime'] w-full rounded-md text-sm bg-gray-800 border-gray-700 text-gray-400 ${
                errors.collabDuration ? "border-red-500" : ""
              }`}
            />

            {errors.collabDuration && (
              <p className="text-red-500 text-xs mt-1">
                {errors.collabDuration.message}
              </p>
            )}
          </div>
          {ruleFields.map((ruleField, index) => {
            switch (ruleField.type) {
              case GiveawayRuleType.TWITTER_FRIENDSHIP:
                return (
                  <TwitterFriendshipRuleInput
                    register={register}
                    control={control}
                    key={ruleField.id}
                    errors={errors}
                    ruleIndex={index}
                    removeRule={removeRule}
                  />
                );
              case GiveawayRuleType.TWITTER_TWEET:
                return (
                  <TwitterTweetRuleInput
                    register={register}
                    control={control}
                    key={ruleField.id}
                    errors={errors}
                    ruleIndex={index}
                    removeRule={removeRule}
                  />
                );

              case GiveawayRuleType.DISCORD_GUILD:
                return (
                  <DiscordGuildRuleInput
                    register={register}
                    control={control}
                    key={ruleField.id}
                    errors={errors}
                    ruleIndex={index}
                    removeRule={removeRule}
                  />
                );

              case GiveawayRuleType.DISCORD_ROLE:
                return (
                  <DiscordRoleRuleInput
                    register={register}
                    control={control}
                    key={ruleField.id}
                    errors={errors}
                    ruleIndex={index}
                    removeRule={removeRule}
                  />
                );

              //  case GiveawayRuleType.MINIMUM_BALANCE:
              //     return (
              //       <MinimumBalanceInput
              //         register={register}
              //         control={control}
              //         key={field.id}
              //         errors={errors}
              //         ruleIndex={index}
              //         removeRule={removeRule}
              //       />
              //     );

              case GiveawayRuleType.OWN_NFT:
                return (
                  <OwnNftInput
                    register={register}
                    control={control}
                    key={ruleField.id}
                    errors={errors}
                    ruleIndex={index}
                    removeRule={removeRule}
                  />
                );

              default:
                return null;
            }
          })}
          {collabType === CollabType.GIVE_SPOTS && (
            <div>
              <div className="flex items-end gap-3">
                <div className="w-full">
                  <div className="flex justify-between items-center">
                    <label className="block text-sm font-medium mb-2 dark:text-white">
                      New Rule
                    </label>
                  </div>

                  <select
                    id="rule"
                    className={`form-select w-full rounded-md text-sm bg-gray-800 border-gray-700 text-gray-400`}
                    onChange={(e) =>
                      setSelectedRuleType(e.target.value as GiveawayRuleType)
                    }
                    // defaultValue={GiveawayRuleType.TWITTER_FRIENDSHIP}
                  >
                    <option value={undefined}>Select one</option>
                    {Object.values(GiveawayRuleType)
                      .filter((x) => x !== GiveawayRuleType.MINIMUM_BALANCE)
                      .map((type) => (
                        <option key={type} value={type}>
                          <>
                            {
                              {
                                [GiveawayRuleType.TWITTER_FRIENDSHIP]:
                                  "Twitter - Relationship",
                                [GiveawayRuleType.TWITTER_TWEET]:
                                  "Twitter - Tweets",
                                [GiveawayRuleType.DISCORD_GUILD]:
                                  "Discord Server",
                                [GiveawayRuleType.DISCORD_ROLE]: "Discord Role",
                                [GiveawayRuleType.MINIMUM_BALANCE]:
                                  "Minimum Balance",
                                [GiveawayRuleType.OWN_NFT]: "Own an NFT",
                              }[type]
                            }
                          </>
                        </option>
                      ))}
                  </select>
                </div>

                <button
                  className="h-10 flex justify-center px-4 items-center border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-500 hover:bg-primary-700"
                  type="button"
                  onClick={() => addNewRule(selectedRuleType)}
                >
                  <RxPlus className="w-5 h-5" />
                  <span className="ml-1">Add</span>
                </button>
              </div>
            </div>
          )}
          <div>
            {project?.allowlist?.type === AllowlistType.DISCORD_ROLE &&
              collabType === "GIVE_SPOTS" &&
              project?.phase === "PREMINT" && (
                <>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-white"
                  >
                    Override Giveaway Role
                  </label>
                  <p className="text-xs mb-2">
                    By default, your giveaway will use the role configured in
                    settings, however you can change this if you wish to give a
                    specific project a more valued role.
                  </p>
                  <div className="">
                    <select
                      id="type"
                      className="form-select block w-full shadow-sm sm:text-sm bg-dark-500 border-gray-600 rounded-md"
                      defaultValue={
                        project?.defaultRoleId
                          ? project?.defaultRoleId
                          : undefined
                      }
                      {...register("settings.overrideRoleId")}
                    >
                      <option value={undefined}>Select One</option>
                      {project.allowlist?.roles?.map((role) => (
                        <option key={role.id} value={role.id}>
                          {role.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}
          </div>
          <div>
            <div className="flex gap-2 items-center">
              <label className="block text-sm font-medium dark:text-white">
                Prevent multiple entries from the same IP
              </label>
              <input
                id="private"
                type="checkbox"
                {...register("settings.preventDuplicateIps")}
                className="form-checkbox h-4 w-4 text-indigo-600 transition duration-150 ease-in-out"
              />
            </div>
            <p className="text-xs">
              Take into consideration that there may be genuine users using the
              same IP.
            </p>
            {/* checkbox */}
            <div className="flex items-center"></div>
          </div>
          {collabType === "RECEIVE_SPOTS" && (
            <div className="">
              <div className="flex items-center gap-2">
                <h2 className="block text-sm font-medium dark:text-white">
                  Request Team Spots
                </h2>
                <input
                  type="checkbox"
                  onChange={(e) => {
                    setTeamSpots(e.target.checked);
                  }}
                  className="form-checkbox h-4 w-4 text-indigo-600 transition duration-150 ease-in-out"
                />
              </div>
              <p className="text-xs mb-2">
                Requesting team spots will create a separate PRIVATE giveaway
                for the other project to approve. Once approved, you can share
                this link with your team.
              </p>

              {teamSpots && (
                <div className="flex items-end gap-3 sm:flex-row flex-col">
                  <div className="w-full">
                    <div className="flex justify-between items-center">
                      <label className="block text-sm font-medium mb-2 dark:text-white">
                        Number Of Spots
                      </label>
                    </div>
                    <input
                      type="number"
                      onWheel={() => {
                        if (document.activeElement instanceof HTMLElement) {
                          document?.activeElement?.blur();
                        }
                      }}
                      id="teamSpots"
                      {...register("teamSpots", {
                        valueAsNumber: true,
                      })}
                      placeholder=""
                      className={`form-input w-full rounded-md text-sm bg-gray-800 border-gray-700 text-gray-400 ${
                        errors.teamSpots ? "border-red-500" : ""
                      }`}
                    />

                    {errors.teamSpots && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.teamSpots.message}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
          {project?.allowlist?.type === AllowlistType.DISCORD_ROLE && (
            <>
              <div>
                <div className="flex gap-2 items-center">
                  <label className="block text-sm font-medium mb-2 dark:text-white">
                    {collabType === CollabType.GIVE_SPOTS && (
                      <>
                        {project?.defaultRoleId ? (
                          <label className="block text-sm font-medium mb-2 text-green-400">
                            The default discord role configured in your giveaway{" "}
                            <a
                              className="underline text-primary-500"
                              href={`/creator/project/${projectSlug}/giveaway-settings`}
                              target="_blank"
                              rel="noreferrer"
                            >
                              settings
                            </a>{" "}
                            will be given to the winners unless changed in the
                            Additional Settings.
                          </label>
                        ) : (
                          <label className="block text-sm font-medium mb-2 text-amber-500">
                            You do not have a default discord role configured in
                            your{" "}
                            <a
                              className="underline text-primary-500"
                              href={`/creator/project/${projectSlug}/giveaway-settings`}
                              target="_blank"
                              rel="noreferrer"
                            >
                              settings
                            </a>{" "}
                            to give to winners. This giveaway will collect
                            wallets and discord users only.
                          </label>
                        )}
                      </>
                    )}
                  </label>
                </div>
              </div>
            </>
          )}
          {project?.allowlist?.type === AllowlistType.DTC && (
            <>
              <div>
                <div className="flex gap-2 items-center">
                  <label className="block text-sm font-medium mb-2 text-green-400">
                    {collabType === CollabType.GIVE_SPOTS
                      ? "Winners of this giveaway will be directly added to your allowlist."
                      : ""}
                  </label>
                </div>
              </div>
            </>
          )}
          {collabType === CollabType.RECEIVE_SPOTS && (
            <div className="flex gap-2 items-center">
              <label className="block text-sm font-medium mb-2 text-amber-500">
                If the other project has a discord based allowlist, the default
                discord role configured in the other projects giveaway settings
                will be given to your participants, otherwise the participants
                will just be added to the allowlist.
              </label>
            </div>
          )}{" "}
          {!project?.allowlist &&
            collabType === CollabType.GIVE_SPOTS &&
            project?.network !== "TBD" && (
              <div className="flex gap-2 items-center">
                <label className="block text-sm font-medium mb-2 text-error-500">
                  In order to give spots, you need to configure an allowlist.
                  You can do this on the{" "}
                  <a
                    className="underline text-primary-500"
                    href={`/creator/project/${projectSlug}/wallet-collection`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Wallet/Allowlist Collection
                  </a>{" "}
                  page.
                </label>
              </div>
            )}
          {collabType === CollabType.RECEIVE_SPOTS && (
            <>
              {(project?.holderRules?.length ?? 0) > 0 ? (
                <div className="flex gap-2 items-center">
                  <label className="block text-sm font-medium mb-2 text-green-400">
                    As you are requesting spots, the holder requirements for
                    receiving spots that you have setup in your{" "}
                    <a
                      className="underline text-primary-500"
                      href={`/creator/project/${projectSlug}/giveaway-settings`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      settings
                    </a>{" "}
                    page, will be applied to this giveaway!
                  </label>
                </div>
              ) : (
                <div className="flex gap-2 items-center">
                  <label className="block text-sm font-medium mb-2 text-red-500">
                    As you are requesting spots, you may want to configure some
                    holder requirements for receiving spots, in your{" "}
                    <a
                      className="underline text-primary-500"
                      href={`/creator/project/${projectSlug}/giveaway-settings`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      settings
                    </a>{" "}
                    page. These rules may include the participants holding one
                    of your NFTs or having a specific discord role.
                  </label>
                </div>
              )}
            </>
          )}
          <button
            type="submit"
            className="w-full flex justify-center py-3 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-500 hover:bg-primary-700"
          >
            {mode === "edit" ? "Update Giveaway" : "Create Giveaway"}
          </button>
        </div>
      </form>
      <Transition appear show={isConfirmOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          onClose={() => setConfirmOpen(false)}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-slate-800 p-6 text-left align-middle shadow-xl transition-all border border-primary-500">
                  <Dialog.Title className="flex justify-between">
                    <h3 className="text-lg font-medium leading-6 text-white">
                      Send collab without Atlas3 bot?
                    </h3>
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md bg-transparent font-medium text-primary-500 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                      onClick={() => setConfirmOpen(false)}
                    >
                      <CloseSquare size={32} />
                    </button>
                  </Dialog.Title>
                  <div className="mt-4">
                    <p className="text-sm text-white text-red-500">
                      You do not have the Atlas3 bot installed in your server,
                      once this giveaway is accepted, your discord server will
                      not be informed. It is advised to add the bot and setup a
                      giveaway channel to get notified of all giveaways!
                    </p>
                    <p className="text-sm text-white mt-2">
                      Are you sure you want to create this collab request
                      anyway?
                    </p>
                  </div>

                  <div className="mt-4 flex justify-between">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-lg border border-primary-500 bg-transparent px-4 py-3 text-xs font-medium text-primary-500 hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                      onClick={() => setConfirmOpen(false)}
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      className="inline-flex justify-center rounded-lg border border-transparent bg-primary-500 px-4 py-3 text-xs font-medium text-white hover:bg-white hover:text-red-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                      onClick={() => {
                        submitForm(formData);
                        setConfirmOpen(false);
                      }}
                    >
                      Yes.
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}

export default function NewGiveaway() {
  return (
    <PublicLayout>
      <CreateOrEditGiveaway mode={"create"} />
    </PublicLayout>
  );
}
