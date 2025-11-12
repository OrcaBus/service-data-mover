import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { DeploymentStackPipeline } from '@orcabus/platform-cdk-constructs/deployment-stack-pipeline';
import { getDataMigrateStackProps } from '../stage/config';
import { DataMigrateStack } from '../stage/deployment-stack';

export class StatelessStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    new DeploymentStackPipeline(this, 'DeploymentPipeline', {
      githubBranch: 'init',
      githubRepo: 'service-data-mover',
      stack: DataMigrateStack,
      stackName: 'DataMigrateStack',
      stackConfig: {
        beta: getDataMigrateStackProps('BETA'),
        gamma: getDataMigrateStackProps('GAMMA'),
        prod: getDataMigrateStackProps('PROD'),
      },
      pipelineName: 'OrcaBus-StatelessDataMover',
      cdkSynthCmd: ['pnpm install --frozen-lockfile --ignore-scripts', 'pnpm cdk-stateless synth'],
    });
  }
}
