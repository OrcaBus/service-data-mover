import { StageName } from '@orcabus/platform-cdk-constructs/shared-config/accounts';
import { DataMigrateStackProps } from './deployment-stack';
import { getDefaultApiGatewayConfiguration } from '@orcabus/platform-cdk-constructs/api-gateway';
import { VPC_LOOKUP_PROPS } from '@orcabus/platform-cdk-constructs/shared-config/networking';
import { DATA_MOVER_ROLE_NAME } from './constants';

export const getDataMigrateStackProps = (stage: StageName): DataMigrateStackProps => {
  // let readFromBuckets = [];
  // let deleteFromBuckets = [];
  // let writeToBuckets = [];
  // switch (stage) {
  //   case "BETA":
  //     // For dev/staging we can write to and read from the same set of buckets.
  //     readFromBuckets = [oncoanalyserBucket[stage], icav2PipelineCacheBucket[stage]];
  //     deleteFromBuckets = [oncoanalyserBucket[stage], icav2PipelineCacheBucket[stage]];
  //
  //     // For dev additionally, write to the filemanager inventory bucket for testing.
  //     writeToBuckets = [
  //       oncoanalyserBucket[stage],
  //       icav2PipelineCacheBucket[stage],
  //       fileManagerInventoryBucket[stage],
  //     ];
  //     break;
  //   case "GAMMA":
  //     readFromBuckets = [oncoanalyserBucket[stage], icav2PipelineCacheBucket[stage]];
  //     deleteFromBuckets = [oncoanalyserBucket[stage], icav2PipelineCacheBucket[stage]];
  //
  //     writeToBuckets = [oncoanalyserBucket[stage], icav2PipelineCacheBucket[stage]];
  //     break;
  //   case "PROD":
  //     readFromBuckets = [oncoanalyserBucket[stage], icav2PipelineCacheBucket[stage]];
  //     deleteFromBuckets = [oncoanalyserBucket[stage], icav2PipelineCacheBucket[stage]];
  //
  //     // For prod, we only allow writing to the archive buckets, nothing else.
  //     writeToBuckets = [icav2ArchiveAnalysisBucket[stage], icav2ArchiveFastqBucket[stage]];
  //     break;
  // }

  return {
    vpcProps: VPC_LOOKUP_PROPS,
    dataMoverRoleName: DATA_MOVER_ROLE_NAME,
    deleteFromBuckets: [],
    readFromBuckets: [],
    writeToBuckets: [],
    logRetention: getDefaultApiGatewayConfiguration(stage).apiGwLogsConfig.retention,
  };
};
