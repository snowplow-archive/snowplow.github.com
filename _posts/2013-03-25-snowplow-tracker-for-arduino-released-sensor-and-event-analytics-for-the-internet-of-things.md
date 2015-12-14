---
layout: post
title: Snowplow Arduino Tracker released - sensor and event analytics for the internet of things
title-short: Snowplow Arduino Tracker
tags: [snowplow, arduino, tracker, internet of things, release]
author: Alex
category: Releases
---

Today we are releasing our first non-Web tracker for Snowplow - an event tracker for the [Arduino] [arduino] open-source electronics prototyping platform. The [Snowplow Arduino Tracker] [snowplow-arduino-tracker] lets you track sensor and event-stream information from one or more IP-connected Arduino boards.

We chose this as our first non-Web tracker because we're hugely excited about the potential of sophisticated analytics for the [Internet of Things] [iot], following in the footsteps of great projects like [Cosm] [cosm] and [Exosite] [exosite]. And of course, Snowplow's extremely-scalable architecture is a great fit for the huge volumes of events and sensor readings which machines are able to generate - you could say that we are already "machine-scale"!

![arduino-photo] [arduino-photo]

As far as we know, this is the first time an event analytics platform has released a dedicated tracker for the maker community; we can't wait to see what the Arduino and Snowplow communities will use it for! Some ideas we had were:

1. Deploying a set of Snowplow-connected Arduinos to monitor the environment (temperature, humidity, light levels etc) in your home
2. Tracking the movement of products around your shop/warehouse/factory using Arduino, [RFID readers] [arduino-rfid] and Snowplow
3. Sending vehicle fleet information (locations, speeds, fuel levels etc) back to Snowplow using Arduino's [3G and GPS] [3g-gps] shields

In fact Alex has gone ahead and written a sample Arduino sketch to track temperatures and log the readings to Snowplow - you can find his project on GitHub at [alexanderdean/arduino-temp-tracker] [arduino-temp-tracker].

Want to find out more? To get started using our event tracker for Arduino, check out:

* The [GitHub repository] [repo]
* The [Technical Documentation] [tech-docs]
* The [Setup Guide] [setup-guide]

Happy making!

[arduino]: http://www.arduino.cc/
[snowplow-arduino-tracker]: https://github.com/snowplow/snowplow-arduino-tracker

[iot]: http://www.forbes.com/sites/ericsavitz/2013/01/14/ces-2013-the-break-out-year-for-the-internet-of-things/

[cosm]: https://cosm.com/
[exosite]: http://exosite.com/

[arduino-photo]: /assets/img/blog/2013/03/arduino-board-photo.jpg

[arduino-rfid]: http://arduino.cc/blog/category/wireless/rfid/
[3g-gps]: http://www.cooking-hacks.com/index.php/documentation/tutorials/arduino-3g-gprs-gsm-gps

[arduino-temp-tracker]: https://github.com/alexanderdean/arduino-temp-tracker

[repo]: https://github.com/snowplow/snowplow-arduino-tracker
[tech-docs]: https://github.com/snowplow/snowplow/wiki/Arduino-Tracker
[setup-guide]: https://github.com/snowplow/snowplow/wiki/Arduino-Tracker-Setup
