/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

#include <QObject>

class TestSettingsManager final : public QObject {
  Q_OBJECT

 private slots:
  // This function is called after each test function
  void cleanup();

  void testGetSetting();

  void testReset();
  void testHardReset();

  void testSerializeLogs();

  void testCreateNewSetting();
  void testCreateNewSettingButSettingAlreadyExists();
};
