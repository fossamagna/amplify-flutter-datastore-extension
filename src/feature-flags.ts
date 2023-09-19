import { type $TSContext, FeatureFlags } from "amplify-cli-core";

/**
 * Return feature flag override values from the cli in the format --feature-flag:<feature flag name> <feature flag value>
 * @param {!AmplifyContext} context the amplify runtime context
 * @param {!string} flagName the feature flag name
 * @returns {any | null} the raw value if found, else null
 */
const cliFeatureFlagOverride = (context: $TSContext, flagName: string) =>
  context.parameters?.options?.[`feature-flag:${flagName}`];

/**
 * Returns feature flag value, default to `false`
 * @param {!AmplifyContext} context the amplify runtime context
 * @param {!string} flagName feature flag id
 * @returns {!boolean} the feature flag value
 */
export const readFeatureFlag = (context: $TSContext, flagName: string) => {
  const cliValue = cliFeatureFlagOverride(context, flagName);
  if (cliValue) {
    if (cliValue === "true" || cliValue === "True" || cliValue === true) {
      return true;
    }
    if (cliValue === "false" || cliValue === "False" || cliValue === false) {
      return false;
    }
    throw new Error(
      `Feature flag value for parameter ${flagName} could not be marshalled to boolean type, found ${cliValue}`,
    );
  }

  try {
    return FeatureFlags.getBoolean(flagName);
  } catch (_) {
    return false;
  }
};

/**
 * Returns feature flag value, default to `1`
 * @param {!AmplifyContext} context the amplify runtime context
 * @param {!string} flagName feature flag id
 * @returns {!number} the feature flag value
 */
export const readNumericFeatureFlag = (
  context: $TSContext,
  flagName: string,
) => {
  const cliValue = cliFeatureFlagOverride(context, flagName);
  if (cliValue) {
    return Number.parseInt(cliValue, 10);
  }

  try {
    return FeatureFlags.getNumber(flagName);
  } catch (_) {
    return 1;
  }
};
