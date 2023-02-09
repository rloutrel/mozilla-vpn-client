/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

@file:Suppress("unused")

package org.mozilla.firefox.vpn.qt

import android.annotation.SuppressLint
import android.content.ContentValues
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.provider.MediaStore
import android.provider.Settings
import android.util.Log
import org.bouncycastle.asn1.ASN1Sequence
import org.bouncycastle.asn1.pkcs.RSAPublicKey
import java.io.IOException
import java.security.KeyFactory
import java.security.Signature
import java.security.spec.RSAPublicKeySpec
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter
import org.mozilla.firefox.vpn.GleanMetrics.GleanBuildInfo
import mozilla.telemetry.glean.Glean
import mozilla.telemetry.glean.config.Configuration

// Companion for AndroidUtils.cpp
object VPNUtils {
    @SuppressLint("NewApi")
    @JvmStatic
    fun getDeviceID(ctx: Context): String {
        return Settings.Secure.getString(ctx.contentResolver, Settings.Secure.ANDROID_ID)
    }

    @SuppressLint("NewApi")
    @JvmStatic
    fun sharePlainText(text: String): Boolean {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.Q) {
            // Not supported on oldies. :c
            return false
        }
        val ctx: Context = VPNActivity.getInstance()
        val resolver = ctx.contentResolver

        // Find the right volume to use:
        val collection = MediaStore.Downloads.getContentUri(MediaStore.VOLUME_EXTERNAL_PRIMARY)
        val dateTime = LocalDateTime.now().format(DateTimeFormatter.ofPattern("y-mm-dd-H-m-ss"))
        val fileMetaData = ContentValues().apply {
            put(MediaStore.Downloads.MIME_TYPE, "text/plain")
            put(MediaStore.Downloads.DISPLAY_NAME, "MozillaVPN_Logs_$dateTime")
            put(MediaStore.Downloads.IS_PENDING, 1)
        }
        // Create the File and get the URI
        val fileURI: Uri? = resolver.insert(collection, fileMetaData)
        if (fileURI == null) {
            return false
        }

        val tx = resolver.openOutputStream(fileURI)
        if (tx == null) {
            return false
        }
        try {
            val writer = tx.writer(Charsets.UTF_8)
            writer?.write(text)
            writer?.flush()
        } catch (e: IOException) {
            return false
        }
        tx.flush()
        tx.close()
        // Now update the Files meta data that the file exists
        fileMetaData.clear()
        fileMetaData.put(MediaStore.Downloads.IS_PENDING, 0)

        try {
            val ok = resolver.update(fileURI, fileMetaData, null, null)
            if (ok == 0) {
                Log.e("MozillaVPNLogs", "resolver update - err: 0 Rows updated")
            }
        } catch (e: Exception) {
            Log.e("MozillaVPNLogs", "resolver update - exception: " + e.message)
        }

        val sendIntent = Intent(Intent.ACTION_SEND)
        sendIntent.putExtra(Intent.EXTRA_STREAM, fileURI)
        sendIntent.setType("*/*")

        val chooseIntent = Intent.createChooser(sendIntent, "Share Logs")
        ctx.startActivity(chooseIntent)
        return true
    }

    @SuppressLint("NewApi")
    @JvmStatic
    fun openNotificationSettings() {
        val context = VPNActivity.getInstance()
        val intent = Intent()
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            intent.setAction(Settings.ACTION_APP_NOTIFICATION_SETTINGS)
            intent.putExtra(Settings.EXTRA_APP_PACKAGE, context.getPackageName())
        } else {
            intent.setAction("android.settings.APP_NOTIFICATION_SETTINGS")
            intent.putExtra("app_package", context.getPackageName())
            intent.putExtra("app_uid", context.getApplicationInfo().uid)
        }
        context.startActivity(intent)
    }

    @SuppressLint("Unused")
    @JvmStatic
    fun verifyContentSignature(publicKey: ByteArray, content: ByteArray, signature: ByteArray): Boolean {
        return try {
            val sig = Signature.getInstance("SHA256withRSA")
            // Use bountycastle to parse the openssl-rsa file
            val pk: RSAPublicKey =
                RSAPublicKey.getInstance(ASN1Sequence.fromByteArray(publicKey))
            // Pass this to android signing stuff :)
            val spec = RSAPublicKeySpec(pk.modulus, pk.publicExponent)
            val kf: KeyFactory = KeyFactory.getInstance("RSA")
            sig.initVerify(kf.generatePublic(spec))

            sig.update(content)
            sig.verify(signature)
        } catch (e: Exception) {
            Log.e("VPNUtils", "Signature Exception $e")
            false
        }
    }

    @SuppressLint("NewApi")
    @JvmStatic
    fun initializeGlean(ctx: Context, isTelemetryEnabled: Boolean, channel: String) {
        Glean.initialize(
            applicationContext = ctx.applicationContext,
            uploadEnabled = isTelemetryEnabled,
            buildInfo = GleanBuildInfo.buildInfo,
            configuration = Configuration(channel = channel)
        )
    }
}