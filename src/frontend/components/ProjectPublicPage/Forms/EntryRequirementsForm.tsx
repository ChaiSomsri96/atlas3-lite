import { RequestCollab } from "@/shared/types";
// import { yupResolver } from "@hookform/resolvers/yup";
import {
  TwitterFriendshipRuleType,
  TwitterActionType,
  DiscordRoleRuleType,
  BlockchainNetwork,
  NftTokenType,
  GiveawayRuleType,
} from "@prisma/client";
import React, { useState } from "react";
import {
  UseFormRegister,
  Control,
  useFieldArray,
  useFormContext,
} from "react-hook-form";
// import { RxPlus } from "react-icons/rx";
import { Heading } from "./SharedFormElements";

function EntryRequirementsForm() {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<RequestCollab>();

  const [selectedRuleType, setSelectedRuleType] = useState<GiveawayRuleType>(
    GiveawayRuleType.DISCORD_GUILD
  );

  const { fields, append, remove } = useFieldArray<RequestCollab>({
    control,
    name: "rules",
  });

  const TwitterFriendshipRuleInput = ({
    register,
    errors,
    ruleIndex,
    // control,
    removeRule,
  }: {
    register: UseFormRegister<RequestCollab>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    errors: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    control?: Control<RequestCollab, any>;
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
                {type}
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
    register: UseFormRegister<RequestCollab>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    errors: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    control?: Control<RequestCollab, any>;
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
                {type}
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
    register: UseFormRegister<RequestCollab>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    errors: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    control?: Control<RequestCollab, any>;
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
            type="text"
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
    register: UseFormRegister<RequestCollab>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    errors: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    control: Control<RequestCollab, any>;
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
          User should have one of the following roles in the given discord
          server.
        </p>
        <div>
          <div className="flex justify-between items-center">
            <label className="block text-sm font-medium mb-2 dark:text-white">
              Discord Server ID
            </label>
            <span className="block text-sm text-gray-500 mb-2">Required</span>
          </div>
          <input
            type="text"
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
                  type="text"
                  id={`rules[${ruleIndex}].discordRoleRule.roles[${index}].id`}
                  {...register(
                    `rules.${ruleIndex}.discordRoleRule.roles.${index}.role.id`
                  )}
                  placeholder="Placeholder"
                  className={`form-input w-full rounded-md text-sm bg-gray-800 border-gray-700 text-gray-400 ${
                    errors?.rules?.[ruleIndex]?.discordRoleRule.roles?.[index]
                      ?.id
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
      </div>
    );
  };

  {
    /*} const MinimumBalanceInput = ({
    register,
    errors,
    ruleIndex,
    removeRule,
  }: {
    register: UseFormRegister<RequestCollab>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    errors: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    control?: Control<RequestCollab, any>;
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
            {...register(
              `rules.${ruleIndex}.minimumBalanceRule.minimumBalance`,
              {
                valueAsNumber: true,
              }
            )}
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
    register: UseFormRegister<RequestCollab>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    errors: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    control?: Control<RequestCollab, any>;
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
              errors?.rules?.[ruleIndex]?.ownNftRule.type
                ? "border-red-500"
                : ""
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
              Collection Address or Contract Address
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
          {errors?.rules?.[ruleIndex]?.ownNftRule
            .collectionAddressOrContract && (
            <p className="mt-2 text-sm text-red-600">
              {
                errors?.rules?.[ruleIndex]?.ownNftRule
                  .collectionAddressOrContract?.message
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

  // const Requirements = () => {
  //   return (
  //     <>
  //       <GridElement label="Requirement Type">
  //         <select
  //           className="text-sm leading-[17px] bg-neutral-800 mt-3 mb-[10px] h-11 border border-neutral-700 rounded-xl py-[14px] px-4"
  //           placeholder="Input text here"
  //         >
  //           {dummyOptions.map((requirement, index) => (
  //             <option value={requirement} key={index} className="pr-4">
  //               {requirement}
  //             </option>
  //           ))}
  //         </select>
  //       </GridElement>
  //       <div className="flex flex-row gap-2 items-center mb-5 justify-between sm:grid sm:grid-flow-col">
  //         <span className="sm:col-span-6">
  //           <GridElement label="Requirement Type">
  //             <select
  //               className="text-sm leading-[17px] bg-neutral-800 mt-3 mb-[10px] h-11 border border-neutral-700 rounded-xl py-3 px-4"
  //               placeholder="Input text here"
  //             >
  //               {dummyOptions.map((requirement, index) => (
  //                 // Since we are going to map this jsx element multiple elements, better create a strong key(timestamp added?)
  //                 <option value={requirement} key={index} className="pr-4">
  //                   {requirement}
  //                 </option>
  //               ))}
  //             </select>
  //           </GridElement>
  //         </span>
  //         <span className="sm:col-span-6">
  //           <GridElement label="Twitter Username">
  //             <select
  //               className="text-sm leading-[17px] bg-neutral-800 mt-3 mb-[10px] h-11 border border-neutral-700 rounded-xl py-3 px-4"
  //               placeholder="Input text here"
  //             >
  //               {dummyOptions.map((requirement, index) => (
  //                 <option value={requirement} key={index} className="pr-4">
  //                   {requirement}
  //                 </option>
  //               ))}
  //             </select>
  //           </GridElement>
  //         </span>
  //         <h3 className="font-bold text-sm leading-4 text-[#EF4444] mt-10 col-span-1 mr-5">
  //           Remove
  //         </h3>
  //       </div>
  //     </>
  //   );
  // };

  return (
    <>
      {/* ----------- Heading -------------------------*/}
      <Heading
        title="Entry Requirements"
        description="These will be suggested to your collabs to include in their giveaways"
      />
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

            {
              /*case GiveawayRuleType.MINIMUM_BALANCE:
            return (
              <MinimumBalanceInput
                register={register}
                control={control}
                key={field.id}
                errors={errors}
                ruleIndex={index}
                removeRule={removeRule}
              />
            );
*/
            }
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
        <div className="flex items-end gap-3 mb-[10px]">
          <div className="w-full">
            <div className="flex justify-between items-center">
              <label className="text-lg leading-[22px] text-neutral-50 mt-5 mb-[10px]">
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
              {Object.values(GiveawayRuleType).map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      <button
        type="button"
        className="font-bold bg-transparent text-sm leading-4 border-primary-500 text-primary-500 px-[18px] py-[15.5px] border-[1px] rounded-xl"
        onClick={() => addNewRule(selectedRuleType)}
      >
        Add requirement
      </button>
    </>
  );
}

export default EntryRequirementsForm;
