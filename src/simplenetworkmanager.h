/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

#ifndef SIMPLENETWORKMANAGER_H
#define SIMPLENETWORKMANAGER_H

#include "networkmanager.h"

class SimpleNetworkManager : public NetworkManager
{
public:
    QNetworkAccessManager *networkAccessManager() override;

private:
    QNetworkAccessManager *m_networkManager = nullptr;
};

#endif // SIMPLENETWORKMANAGER_H
