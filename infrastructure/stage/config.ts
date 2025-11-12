import { StageName } from '@orcabus/platform-cdk-constructs/shared-config/accounts';
import { DataMigrateStackProps } from './deployment-stack';
import { getDefaultApiGatewayConfiguration } from '@orcabus/platform-cdk-constructs/api-gateway';
import { VPC_LOOKUP_PROPS } from '@orcabus/platform-cdk-constructs/shared-config/networking';
import { DATA_MOVER_ROLE_NAME } from './constants';
import {
  ANALYSIS_ARCHIVE_BUCKET,
  FASTQ_ARCHIVE_BUCKET,
  ONCOANALYSER_BUCKET,
} from '@orcabus/platform-cdk-constructs/shared-config/s3';
import {
  FILE_MANAGER_CACHE_BUCKETS,
  FILE_MANAGER_INVENTORY_BUCKET,
} from '@orcabus/platform-cdk-constructs/shared-config/file-manager';

export const getDataMigrateStackProps = (stage: StageName): DataMigrateStackProps => {
  let readFromBuckets = [];
  let deleteFromBuckets = [];
  let writeToBuckets = [];
  switch (stage) {
    case 'BETA':
      // For dev/staging we can write to and read from the same set of buckets.
      readFromBuckets = [ONCOANALYSER_BUCKET.BETA, ...FILE_MANAGER_CACHE_BUCKETS.BETA];
      deleteFromBuckets = [ONCOANALYSER_BUCKET.BETA, ...FILE_MANAGER_CACHE_BUCKETS.BETA];
      // For dev additionally, write to the filemanager inventory bucket for testing.
      writeToBuckets = [
        FILE_MANAGER_INVENTORY_BUCKET,
        ONCOANALYSER_BUCKET.BETA,
        ...FILE_MANAGER_CACHE_BUCKETS.BETA,
      ];
      break;
    case 'GAMMA':
      readFromBuckets = [ONCOANALYSER_BUCKET.GAMMA, ...FILE_MANAGER_CACHE_BUCKETS.GAMMA];
      deleteFromBuckets = [ONCOANALYSER_BUCKET.GAMMA, ...FILE_MANAGER_CACHE_BUCKETS.GAMMA];
      writeToBuckets = [ONCOANALYSER_BUCKET.GAMMA, ...FILE_MANAGER_CACHE_BUCKETS.GAMMA];
      break;
    case 'PROD':
      readFromBuckets = [ONCOANALYSER_BUCKET.PROD, ...FILE_MANAGER_CACHE_BUCKETS.PROD];
      deleteFromBuckets = [ONCOANALYSER_BUCKET.PROD, ...FILE_MANAGER_CACHE_BUCKETS.PROD];

      // For prod, we only allow writing to the archive buckets, nothing else.
      writeToBuckets = [ANALYSIS_ARCHIVE_BUCKET, FASTQ_ARCHIVE_BUCKET];
      break;
  }

  return {
    vpcProps: VPC_LOOKUP_PROPS,
    dataMoverRoleName: DATA_MOVER_ROLE_NAME,
    deleteFromBuckets,
    readFromBuckets,
    writeToBuckets,
    logRetention: getDefaultApiGatewayConfiguration(stage).apiGwLogsConfig.retention,
  };
};
