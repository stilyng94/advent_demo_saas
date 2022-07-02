import AWS from "aws-sdk";

const accessKeyId = process.env.AWS_ACCESS_KEY;
const secretAccessKey = process.env.AWS_SECRET_KEY;

AWS.config.update({
  accessKeyId,
  secretAccessKey,
  region: "eu-west-1",
});

const route53 = new AWS.Route53();

async function run(domain) {

  const res = await route53.changeResourceRecordSets({
    HostedZoneId: 'advent.com',
    ChangeBatch: {
      Changes: [{
        Action: 'CREATE',
        ResourceRecordSet: {
          Name: 'domain.adevnt.com',
          Type: 'CNAME',
          TTL: 60 * 5, // 5 minutes
          ResourceRecords: [{ Value: 'mongoosejs.com' }]
        }
      }]
    }
  }).promise();
  console.log(res);
}
run("").catch((err) => console.log(err));
