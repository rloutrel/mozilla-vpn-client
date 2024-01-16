/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

#include "ioswidgets.h"
#include "Mozilla-Swift.h"
#include "leakdetector.h"
#include "logger.h"

namespace {

Logger logger("IOSWidgets");

// Our Swift singleton.
IOSWidgetsImpl* impl = nullptr;

}  // namespace

IOSWidgets::IOSWidgets() {
  MZ_COUNT_CTOR(IOSWidgets);

  impl = [[IOSWidgetsImpl alloc] init];
  Q_ASSERT(impl);
}

IOSWidgets::~IOSWidgets() {
  MZ_COUNT_DTOR(IOSWidgets);

  if (impl) {
    [impl dealloc];
    impl = nullptr; 
  }
}

void IOSWidgets::saveFirstRecent(QString data) {
    [impl saveFirstRecentWithData:data.toNSString()];
}

void IOSWidgets::saveSecondRecent(QString data) {
    [impl saveSecondRecentWithData:data.toNSString()];
}

void IOSWidgets::saveCurrent(QString data) {
    [impl saveCurrentWithData:data.toNSString()];
}

void IOSWidgets::reloadWidgets() {
    [impl reloadWidgets];
}
