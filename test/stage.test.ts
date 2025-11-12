import { App, Aspects, Stack } from 'aws-cdk-lib';
import { Annotations, Match } from 'aws-cdk-lib/assertions';
import { AwsSolutionsChecks, NagSuppressions } from 'cdk-nag';
import { synthesisMessageToString } from '@orcabus/platform-cdk-constructs/utils';
import { DataMigrateStack } from '../infrastructure/stage/deployment-stack';
import { getDataMigrateStackProps } from '../infrastructure/stage/config';

function applyIAMWildcardSuppression(stack: Stack) {
  NagSuppressions.addResourceSuppressions(
    stack,
    [
      {
        id: 'AwsSolutions-IAM5',
        reason: "'*' is required to access objects in the indexed bucket by the data mover",
        appliesTo: [
          'Resource::arn:aws:s3:::org.umccr.data.oncoanalyser/*',
          'Resource::arn:aws:s3:::pipeline-prod-cache-503977275616-ap-southeast-2/*',
          'Resource::arn:aws:s3:::archive-prod-analysis-503977275616-ap-southeast-2/*',
          'Resource::arn:aws:s3:::archive-prod-fastq-503977275616-ap-southeast-2/*',
        ],
      },
    ],
    true
  );
}

/**
 * Apply nag suppression for the stateless stack
 * @param stack
 */
function applyStatelessNagSuppressions(stack: Stack) {
  applyIAMWildcardSuppression(stack);

  NagSuppressions.addStackSuppressions(
    stack,
    [{ id: 'AwsSolutions-IAM4', reason: 'allow AWS managed policy' }],
    true
  );
  NagSuppressions.addResourceSuppressionsByPath(
    stack,
    '/DataMigrateStack/StateMachine/Role/DefaultPolicy/Resource',
    [
      {
        id: 'AwsSolutions-IAM5',
        reason: '* is required to SendTaskSuccess/SendTaskFailure',
      },
    ],
    true
  );
  NagSuppressions.addResourceSuppressionsByPath(
    stack,
    '/DataMigrateStack/Role/DefaultPolicy/Resource',
    [
      {
        id: 'AwsSolutions-IAM5',
        reason: '* is required to SendTaskSuccess/SendTaskFailure',
      },
    ],
    true
  );
  NagSuppressions.addResourceSuppressionsByPath(
    stack,
    '/DataMigrateStack/TaskDefinition/ExecutionRole/DefaultPolicy/Resource',
    [
      {
        id: 'AwsSolutions-IAM5',
        reason: '* is required to SendTaskSuccess/SendTaskFailure',
      },
    ],
    true
  );
  NagSuppressions.addResourceSuppressionsByPath(
    stack,
    '/DataMigrateStack/FargateCluster/Resource',
    [
      {
        id: 'AwsSolutions-ECS4',
        reason: 'container insights v2 is enabled',
      },
    ],
    true
  );
  NagSuppressions.addResourceSuppressionsByPath(
    stack,
    '/DataMigrateStack/StateMachine/Resource',
    [
      {
        id: 'AwsSolutions-SF1',
        reason: 'the ECS container is loggin instead',
      },
      {
        id: 'AwsSolutions-SF2',
        reason: 'the ECS container is loggin instead',
      },
    ],
    true
  );
}

/**
 * Run the CDK nag checks.
 */
function cdkNagStack(stack: Stack, applySuppressions: (stack: Stack) => void) {
  Aspects.of(stack).add(new AwsSolutionsChecks());
  applySuppressions(stack);

  test(`cdk-nag AwsSolutions Pack errors`, () => {
    const errors = Annotations.fromStack(stack)
      .findError('*', Match.stringLikeRegexp('AwsSolutions-.*'))
      .map(synthesisMessageToString);
    expect(errors).toHaveLength(0);
  });

  test(`cdk-nag AwsSolutions Pack warnings`, () => {
    const warnings = Annotations.fromStack(stack)
      .findWarning('*', Match.stringLikeRegexp('AwsSolutions-.*'))
      .map(synthesisMessageToString);
    expect(warnings).toHaveLength(0);
  });
}

describe('cdk-nag-stateless-stack', () => {
  const app = new App();

  const dataMigrateStack = new DataMigrateStack(app, 'DataMigrateStack', {
    ...getDataMigrateStackProps('PROD'),
    env: {
      account: '123456789',
      region: 'ap-southeast-2',
    },
  });

  cdkNagStack(dataMigrateStack, applyStatelessNagSuppressions);
});
