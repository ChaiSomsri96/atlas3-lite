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
  TwitterActionType,
  TwitterFriendshipRuleType,
} from "@prisma/client";
import { RxPlus } from "react-icons/rx";
import { useEffect, useState } from "react";
import PublicLayout from "@/frontend/components/Layout/PublicLayout";
import { ExtendedGiveaway } from "@/frontend/hooks/useGiveaway";
import { useAllowlistRoles } from "@/frontend/hooks/useAllowlistRoles";
import toast from "react-hot-toast";
import { ErrorMessage } from "@/styles/FormComponents";
import { useS3Upload } from "next-s3-upload";
import { useProject } from "@/frontend/hooks/useProject";
import { usePaymentTokens } from "@/frontend/hooks/usePaymentTokens";
import { useSession } from "next-auth/react";

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
                  `rules.${ruleIndex}.discordRoleRule.roles.${index}.role.id`
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
                  `rules.${ruleIndex}.discordRoleRule.roles.${index}.role.name`
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

{
  /*const MinimumBalanceInput = ({
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
        <p>Rule {ruleIndex + 1}: Minimum Balance</p>

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
            Discord Server Name
          </label>
          <span className="block text-sm text-gray-500 mb-2">Required</span>
        </div>
        <select
          id={`rules[${ruleIndex}].minimumBalanceRule.network`}
          {...register(`rules.${ruleIndex}.minimumBalanceRule.network`, {
            valueAsNumber: true,
          })}
          className={`form-input w-full rounded-md text-sm bg-gray-800 border-gray-700 text-gray-400 ${
            errors?.rules?.[ruleIndex]?.minimumBalanceRule.network
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

        {errors?.rules?.[ruleIndex]?.minimumBalanceRule.network && (
          <p className="mt-2 text-sm text-red-600">
            {errors?.rules?.[ruleIndex]?.minimumBalanceRule.network?.message}
          </p>
        )}
      </div>

      <div>
        <div className="flex justify-between items-center">
          <label className="block text-sm font-medium mb-2 dark:text-white">
            Minimum Balance
          </label>
          <span className="block text-sm text-gray-500 mb-2">Required</span>
        </div>
        <input
          type="number"
          id={`rules[${ruleIndex}].minimumBalanceRule.minimumBalance`}
          {...register(`rules.${ruleIndex}.minimumBalanceRule.minimumBalance`, {
            valueAsNumber: true,
          })}
          placeholder="Placeholder"
          className={`form-input w-full rounded-md text-sm bg-gray-800 border-gray-700 text-gray-400 ${
            errors?.rules?.[ruleIndex]?.minimumBalanceRule.minimumBalance
              ? "border-red-500"
              : ""
          }`}
        />
        {errors?.rules?.[ruleIndex]?.minimumBalanceRule.minimumBalance && (
          <p className="mt-2 text-sm text-red-600">
            {
              errors?.rules?.[ruleIndex]?.minimumBalanceRule.minimumBalance
                ?.message
            }
          </p>
        )}
      </div>

      <div>
        <div className="flex justify-between items-center">
          <label className="block text-sm font-medium mb-2 dark:text-white">
            Token Address
          </label>
          <span className="block text-sm text-gray-500 mb-2">Required</span>
        </div>
        <input
          type="text"
          id={`rules[${ruleIndex}].minimumBalanceRule.minimumBalance`}
          {...register(`rules.${ruleIndex}.minimumBalanceRule.tokenAddress`)}
          placeholder="Placeholder"
          className={`form-input w-full rounded-md text-sm bg-gray-800 border-gray-700 text-gray-400 ${
            errors?.rules?.[ruleIndex]?.minimumBalanceRule.tokenAddress
              ? "border-red-500"
              : ""
          }`}
        />
        {errors?.rules?.[ruleIndex]?.minimumBalanceRule.tokenAddress && (
          <p className="mt-2 text-sm text-red-600">
            {
              errors?.rules?.[ruleIndex]?.minimumBalanceRule.tokenAddress
                ?.message
            }
          </p>
        )}
      </div>
    </div>
  );
};
*/
}

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
  mode: "create" | "edit" | "duplicate" | "editCollab";
}) {
  const handleCreateGiveaway = useHandleCreateGiveaway();
  const router = useRouter();
  const [selectedRuleType, setSelectedRuleType] = useState<GiveawayRuleType>(
    GiveawayRuleType.DISCORD_GUILD
  );
  const editMode = mode === "editCollab";
  const { data: session } = useSession();

  console.log(session?.user?.type);

  const { uploadToS3 } = useS3Upload();

  const { projectSlug } = router.query;

  const validationSchema = Yup.object().shape({
    name: Yup.string().required("Project name is required"),
  });

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    imageType: "bannerUrl"
  ) => {
    console.log("Uploading...");

    if (!e.target.files) return;
    const file = e.target.files[0];
    if (file.size / 1024 > 1024) {
      toast.error("File too large");
      return;
    }
    const { url } = await uploadToS3(file);

    setValue(imageType, url);
  };

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<GiveawayInput>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      name: giveaway?.name,
      description: giveaway?.description,
      maxWinners: giveaway?.maxWinners,
      rules: giveaway?.rules,
      endsAt: giveaway?.collabRequestDeadline
        ? new Date(giveaway?.collabRequestDeadline).toISOString().split(".")[0]
        : giveaway?.endsAt
        ? new Date(giveaway?.endsAt).toISOString().split(".")[0]
        : "",
      type: giveaway?.type,
      network: giveaway?.network ? giveaway?.network : "Solana",
    },
  });

  const isPaymentEnabled = watch("isPaymentEnabled", false);
  const giveawayType = watch("type", GiveawayType.MANUAL);

  const { fields, append, remove } = useFieldArray<GiveawayInput>({
    control,
    name: "rules",
  });

  const addNewRule = (type: GiveawayRuleType) => {
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

      case GiveawayRuleType.MINIMUM_BALANCE:
        return append({
          type,
          minimumBalanceRule: {
            minimumBalance: 0,
            network: BlockchainNetwork.Solana,
            tokenAddress: "0x0",
          },
        });

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

  const onSubmit = (data: GiveawayInput) => {
    console.log(JSON.stringify(data, null, 2));

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

    if (isPaymentEnabled && giveawayType == GiveawayType.RAFFLE) {
      if (
        !data.paymentTokenId ||
        data.paymentTokenId == "" ||
        !data.paymentTokenAmount
      ) {
        toast.error("You need to fill payment token information.");
        return;
      }
    } else {
      data.paymentTokenId = undefined;
      data.paymentTokenAmount = undefined;
    }

    handleCreateGiveaway.mutate({
      id: mode === "edit" || mode === "editCollab" ? giveaway?.id : undefined,
      ...data,
      projectSlug: projectSlug as string,
    });
  };

  const { data: project } = useProject({
    slug: projectSlug as string,
  });

  const { data: paymentTokens } = usePaymentTokens();

  useEffect(() => {
    if (
      !editMode &&
      mode !== "edit" &&
      (project?.holderRules?.length ?? 0) > 0
    ) {
      setValue("rules", project?.holderRules ?? []);
    }
  }, [project?.holderRules]);

  useEffect(() => {
    if (giveaway && paymentTokens) {
      if (giveaway.paymentTokenId) {
        setValue("isPaymentEnabled", true);
        setValue("paymentTokenId", giveaway.paymentTokenId);
      }
      if (giveaway.paymentTokenAmount) {
        setValue("paymentTokenAmount", giveaway.paymentTokenAmount);
      }
    }
  }, [giveaway, paymentTokens]);

  const [discordRoleEnabled, setDiscordRoleEnabled] = useState(false);
  const discordRoles = useAllowlistRoles({
    projectId:
      watch("collabProjectId") &&
      watch("collabType") === CollabType.RECEIVE_SPOTS
        ? watch("collabProjectId")
        : undefined,
    projectSlug: watch("collabProjectId") ? undefined : (projectSlug as string),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-4 sm:space-y-3 mb-4">
        <div>
          <div className="flex justify-between items-center">
            <label className="block text-sm font-medium mb-2 dark:text-white">
              Giveaway Name
            </label>
            <span className="block text-sm text-gray-500 mb-2">Required</span>
          </div>
          <input
            type="text"
            id="name"
            {...register("name")}
            placeholder="Placeholder"
            className={`form-input w-full rounded-md text-sm bg-gray-800 border-gray-700 text-gray-400 ${
              errors.name ? "border-red-500" : ""
            }`}
          />

          {errors.name && (
            <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
          )}
        </div>

        {project?.allowlist?.type === AllowlistType.DISCORD_ROLE &&
          project?.discordGuild &&
          project?.phase === "PREMINT" && (
            <>
              <div>
                <div className="flex gap-2 items-center">
                  <label className="block text-sm font-medium dark:text-white">
                    Grant Discord Role to Winners
                  </label>
                  <input
                    id="grantRole"
                    type="checkbox"
                    className="form-checkbox h-4 w-4 text-indigo-600 transition duration-150 ease-in-out"
                    onClick={() => {
                      setDiscordRoleEnabled(!discordRoleEnabled);
                    }}
                  />
                </div>
                <p className="text-xs">
                  Note that ticking this option means that winners will be added
                  to your allowlist.
                </p>
                {/* checkbox */}
                <div className="flex items-center"></div>
              </div>

              {discordRoleEnabled && (
                <>
                  <p className="text-sm">
                    This is the role that your bot will give to the winners.
                  </p>
                  <select
                    id="giveawayRoleId"
                    {...register("giveawayRoleId")}
                    className={`form-select w-full rounded-md text-sm bg-gray-800 border-gray-700 text-gray-400 ${
                      errors.giveawayRoleId ? "border-red-500" : ""
                    }`}
                  >
                    {discordRoles?.data?.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.name}
                      </option>
                    ))}
                  </select>

                  {errors.giveawayRoleId && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.giveawayRoleId.message}
                    </p>
                  )}
                </>
              )}
            </>
          )}

        {!discordRoleEnabled && !editMode && (
          <>
            <div>
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium mb-2 dark:text-white">
                  Description
                </label>
                <span className="block text-sm text-gray-500 mb-2">
                  Required
                </span>
              </div>

              <textarea
                className={`form-input w-full rounded-md text-sm bg-gray-800 border-gray-700 text-gray-400 ${
                  errors.description ? "border-red-500" : ""
                }`}
                rows={3}
                id="name"
                {...register("description")}
                placeholder="Placeholder"
              />

              {errors.description && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.description.message}
                </p>
              )}
            </div>
            <div>
              <p className="text-white text-sm font-medium">Giveaway Banner</p>
              <p className="text-xs text-white">
                Recommended ratio: 3:1 and max size 1MB. Defaults to your
                project banner if not configured.
              </p>

              <input
                type="file"
                className="mb-2"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleFileChange(e, "bannerUrl")
                }
              />
              {getValues("bannerUrl") && (
                <img
                  src={getValues("bannerUrl") ?? ""}
                  alt=""
                  className="h-24"
                />
              )}
              {errors.bannerUrl && (
                <ErrorMessage>{errors.bannerUrl.message}</ErrorMessage>
              )}
            </div>
          </>
        )}

        {!editMode && (
          <>
            <div>
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium mb-2 dark:text-white">
                  Winners Count
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
                <span className="block text-sm text-gray-500 mb-2">
                  Required
                </span>
              </div>

              <select
                id="type"
                {...register("type")}
                className={`form-select w-full rounded-md text-sm bg-gray-800 border-gray-700 text-gray-400 ${
                  errors.name ? "border-red-500" : ""
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
                <p className="text-red-500 text-xs mt-1">
                  {errors.type.message}
                </p>
              )}
            </div>

            <div>
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium mb-2 dark:text-white">
                  End Date (Local Time)
                </label>
                <span className="block text-sm text-gray-500 mb-2">
                  Required
                </span>
              </div>
              <input
                type="datetime-local"
                id="name"
                {...register("endsAt")}
                step="any"
                placeholder="Placeholder"
                className={`input[type='datetime'] w-full rounded-md text-sm bg-gray-800 border-gray-700 text-gray-400 ${
                  errors.endsAt ? "border-red-500" : ""
                }`}
              />

              {errors.endsAt && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.endsAt.message}
                </p>
              )}
            </div>
          </>
        )}

        {fields.map((field, index) => {
          switch (field.type) {
            case GiveawayRuleType.TWITTER_FRIENDSHIP:
              return (
                <TwitterFriendshipRuleInput
                  register={register}
                  control={control}
                  key={field.id}
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
                  key={field.id}
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
                  key={field.id}
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
                  key={field.id}
                  errors={errors}
                  ruleIndex={index}
                  removeRule={removeRule}
                />
              );

            case GiveawayRuleType.OWN_NFT:
              return (
                <OwnNftInput
                  register={register}
                  control={control}
                  key={field.id}
                  errors={errors}
                  ruleIndex={index}
                  removeRule={removeRule}
                />
              );

            default:
              return null;
          }
        })}

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
                            [GiveawayRuleType.DISCORD_GUILD]: "Discord Server",
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

        {!editMode && (
          <div>
            <div className="flex gap-2 items-center">
              <label className="block text-sm font-medium dark:text-white">
                Private Giveaway
              </label>
              <input
                id="private"
                type="checkbox"
                {...register("settings.private")}
                className="form-checkbox h-4 w-4 text-indigo-600 transition duration-150 ease-in-out"
              />
            </div>
            <p className="text-xs">
              After the giveaway is created, you can copy the private link from
              your giveaways page.
            </p>
          </div>
        )}

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

        {!editMode && (
          <div>
            <div className="flex justify-between items-center">
              <label className="block text-sm font-medium dark:text-white">
                Network of wallets to collect
              </label>
            </div>
            <p className="text-xs mb-2">
              The network of wallets that you want to collect as part of this
              giveaway. By default it will be set to your projects network.
            </p>
            <select
              id="network"
              {...register("network")}
              defaultValue={project?.network ?? BlockchainNetwork.Solana}
              className={`form-select w-full rounded-md text-sm bg-gray-800 border-gray-700 text-gray-400 ${
                errors.name ? "border-red-500" : ""
              }`}
            >
              {Object.values(BlockchainNetwork).map((network) => (
                <option key={network} value={network}>
                  <>{network}</>
                </option>
              ))}
            </select>

            {errors.type && (
              <p className="text-red-500 text-xs mt-1">{errors.type.message}</p>
            )}
            {watch("network") === "TBD" && (
              <label className="block text-sm font-medium text-amber-500 mt-2">
                No wallets will be collected as `Network of wallets to collect`
                is set to TBD. Only users will be collected.
              </label>
            )}
          </div>
        )}

        {!editMode && (
          <>
            {project?.channelPostSettings &&
            project?.channelPostSettings.length > 0 ? (
              <div className="flex gap-2 items-center">
                <label className="block text-sm font-medium dark:text-white">
                  Post giveaway to discord?
                </label>
                <input
                  id="discordPost"
                  type="checkbox"
                  {...register("discordPost")}
                  className="form-checkbox h-4 w-4 text-indigo-600 transition duration-150 ease-in-out"
                />
              </div>
            ) : (
              <p className="text-sm mb-3">
                Setup a giveaway channel in your giveaway settings so that you
                can allow giveaways to be posted to your discord.
              </p>
            )}
          </>
        )}

        {(project?.holderRules?.length ?? 0) === 0 && (
          <div className="flex gap-2 items-center">
            <label className="block text-sm font-medium mb-2 text-amber-500">
              Setup some default giveaway requirements on your{" "}
              <a
                className="underline text-primary-500"
                href={`/creator/project/${projectSlug}/giveaway-settings`}
                target="_blank"
                rel="noreferrer"
              >
                settings
              </a>{" "}
              page so that they get applied to each giveaway you do, saving you
              time and effort.
            </label>
          </div>
        )}

        {giveawayType == GiveawayType.RAFFLE && (
          <div className="">
            <div className="flex items-center my-4 gap-2">
              <h2 className="block text-sm font-medium dark:text-white">
                Charge payment for entry ticket
              </h2>
              <input
                id="isPaymentEnabled"
                type="checkbox"
                disabled={mode === "edit" || mode === "editCollab"}
                {...register("isPaymentEnabled")}
                className="form-checkbox h-4 w-4 text-indigo-600 transition duration-150 ease-in-out"
              />
            </div>

            {isPaymentEnabled && (
              <div className="flex items-end gap-3 sm:flex-row flex-col">
                <div className="w-full">
                  <div className="flex justify-between items-center">
                    <label className="block text-sm font-medium mb-2 dark:text-white">
                      Payment Token
                    </label>
                  </div>
                  <select
                    id="paymentTokenId"
                    {...register("paymentTokenId")}
                    disabled={mode === "edit" || mode === "editCollab"}
                    className={`form-select w-full rounded-md text-sm bg-gray-800 border-gray-700 text-gray-400 ${
                      errors.paymentTokenId ? "border-red-500" : ""
                    }`}
                  >
                    <option value="">Select one</option>
                    {paymentTokens &&
                      paymentTokens.map((token) => (
                        <option key={token.tokenAddress} value={token.id}>
                          {token.tokenName}
                        </option>
                      ))}
                  </select>

                  {errors.paymentTokenId && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.paymentTokenId.message}
                    </p>
                  )}
                </div>

                <div className="w-full">
                  <div className="flex justify-between items-center">
                    <label className="block text-sm font-medium mb-2 dark:text-white">
                      Token Amount
                    </label>
                  </div>
                  <input
                    type="number"
                    onWheel={() => {
                      if (document.activeElement instanceof HTMLElement) {
                        document?.activeElement?.blur();
                      }
                    }}
                    id="paymentTokenAmount"
                    disabled={mode === "edit" || mode === "editCollab"}
                    {...register("paymentTokenAmount", {
                      valueAsNumber: true,
                    })}
                    placeholder=""
                    className={`form-input w-full rounded-md text-sm bg-gray-800 border-gray-700 text-gray-400 ${
                      errors.paymentTokenAmount ? "border-red-500" : ""
                    }`}
                  />

                  {errors.paymentTokenAmount && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.paymentTokenAmount.message}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        <button
          type="submit"
          className="w-full flex justify-center py-3 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-500 hover:bg-primary-700"
        >
          {mode === "edit" || mode === "editCollab"
            ? "Update Giveaway"
            : "Create Giveaway"}
        </button>
      </div>
    </form>
  );
}

export default function NewGiveaway() {
  return (
    <PublicLayout>
      <CreateOrEditGiveaway mode={"create"} />
    </PublicLayout>
  );
}
