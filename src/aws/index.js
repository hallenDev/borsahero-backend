import * as AWS from "aws-sdk";
import { config } from "~/config/awsConfig";

AWS.config.update(config);

export default AWS;
