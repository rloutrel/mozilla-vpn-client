/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

#include <stdint.h>

namespace Constants {

// Let's refresh the IP address any 10 seconds (in milliseconds).
#ifndef UNIT_TEST
constexpr int IPADDRESS_TIMER_MSEC = 10000;
#else
constexpr int IPADDRESS_TIMER_MSEC = 0;
#endif

// Let's check the connection status any second.
#ifndef UNIT_TEST
constexpr int CHECKSTATUS_TIMER_MSEC = 1000;
#else
constexpr int CHECKSTATUS_TIMER_MSEC = 0;
#endif

// Number of points for the charts.
constexpr int CHARTS_MAX_POINTS = 30;

// Any 6 hours, a new check
#ifndef UNIT_TEST
constexpr uint32_t RELEASE_MONITOR_MSEC = 21600000;
#else
constexpr uint32_t RELEASE_MONITOR_MSEC = 0;
#endif

// in milliseconds, how often we should fetch the server list and the account.
#ifndef QT_DEBUG
constexpr const uint32_t SCHEDULE_ACCOUNT_AND_SERVERS_TIMER_MSEC = 3600000;
#else
constexpr const uint32_t SCHEDULE_ACCOUNT_AND_SERVERS_TIMER_MSEC = 120000;
#endif

}; // namespace Constants
