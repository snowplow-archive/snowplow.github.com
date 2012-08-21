---
layout: section
category: product
title: Get started!
weight: 6
---

# Get started with SnowPlow

There are two options when implementing SnowPlow:

1. **Self-hosting SnowPlow on your own Amazon account**. This requires more administrative effort to setup and run, but means all your web analytics data is stored on your Amazon account.
2. **Have the SnowPlow team host SnowPlow for you**. This is more straightforward to setup / maintain, but means your data will be stored on a SnowPlow run Amazon S3 account. Learn more about [SnowPlow professional services] [pro-services].

For users who use our hosted service, the following steps are required to get up and running:

1. Get in touch with the [SnowPlow team][contact-us]. We will set you up with an 'account_id'
2. Implement the SnowPlow Javascript tracking tags on your website. A guide to implement the tracking tags can be found [here] [implement-javascript-tracking]
3. Download and install the [Elastic Mapreduce command line tools] [emr-cli-tools] from the Amazon website. You will use these tools to perform analytics in Hive
4. Get the login 'credentials.json' file from the SnowPlow team and add it to your command line tools folder. This will enable you to connect with your data via the Elastic Mapreduce command line tools
5. Setup and configure SSH for the command line tools. Insructions can be found [here] [ssh-for-emr-cli]
5. Fire up the command line tools and start analysing your data! An introduction to data analysis with Hive can be found [here] [intro-to-data-analysis-with-hive]

For users who are self hosting their own SnowPlow instance, a few more steps are involved to get up and running:

1. Setup an [Amazon web services] [aws] account, if you do not already have one, and enable [Cloudfront] [cloudfront] on it
2. Upload the tracing pixel to a bucket on S3
3. Create a Cloudfront distribution for the S3 bucket you uploaded the tracking pixel. This will be used to serve the tracking pixel at lightning fast speed, every time it is called from your website(s).
4. Switch on logging for that Cloudfront distribution. The Amazon logging service is what will record all the different tracking requests made by the SnowPlow javascript tags. This will be the data that we process in Hive. (Note: **full instructions on how to perform steps 1-4** can be found [here] [self-hosting-tracking-pixel])
5. Host 'snowplow.js'. This step is optional, you can use the copy of 'snowplow.js' that the SnowPlow team host (on 'http://d1fc8wv8zag5ca.cloudfront.net/sp.js'), however, for the reasons described [here] [self-hosting-the-js], we recommend self-hosting. Instructions on how to do this using Amazon Cloudfront can be found [here] [self-hosting-the-js]
6. Integrate SnowPlow javascript tracking tags on your site. A guide to doing this can be found [here] [implement-javascript-tracking]
7. Download and install the [Elastic Mapreduce command line tools] [emr-cli-tools] from the Amazon website. You will use these tools to perform analytics in Hive
8. Configure the 'credentials.json' file for the command-line-tools as described [here] [setup-emr-cli]
9. Setup SSH for the command line tools, as documented [here] [ssh-for-emr-cli]
10. Log into the command line tools and start analysing your data! An introduction to data analysis with Hive can be found [here] [intro-to-data-analysis-with-hive]




[pro-services]: /services/index.html
[contact-us]: http://www.infobright.org/
[implement-javascript-tracking]: https://github.com/snowplow/snowplow/wiki/Integrating-SnowPlow-into-your-website
[emr-cli-tools]: http://aws.amazon.com/developertools/2264
[self-hosting-tracking-pixel]: https://github.com/snowplow/snowplow/wiki/Self-hosting-the-tracking-pixel
[self-hosting-the-js]: https://github.com/snowplow/snowplow/wiki/Self-hosting-snowplow-js
[setup-emr-cli]: http://docs.amazonwebservices.com/ElasticMapReduce/latest/GettingStartedGuide/SignUp.html#ConfigCredentials
[ssh-for-emr-cli]: http://docs.amazonwebservices.com/ElasticMapReduce/latest/GettingStartedGuide/SignUp.html#emr-gsg-ssh-setup-config
[intro-to-data-analysis-with-hive]: analysing-data-with-snowplow.html
[aws]: http://aws.amazon.com/
[cloudfront]: http://aws.amazon.com/cloudfront/
