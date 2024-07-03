import { Module } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { FirebaseService } from './firebase.service';
import { ServiceAccount } from 'firebase-admin';

@Module({
  providers: [
    {
      provide: 'FIREBASE',
      useFactory: () => {
        if (!admin.apps.length) {
          return admin.initializeApp({
            credential: admin.credential.cert({
              type: process.env.TYPE,
              project_id: process.env.PROJECT_ID,
              private_key_id: process.env.PRIVATE_KEY_ID,
              private_key: process.env.PRIVATE_KEY,
              client_email: process.env.CLIENT_EMAIL,
              client_id: process.env.CLIENT_ID,
              auth_uri: process.env.AUTH_URI,
              token_uri: process.env.TOKEN_URI,
              auth_provider_x509_cert_url: process.env.AUTH_CERT_URL,
              client_x509_cert_url: process.env.CLIENT_CERT_URL,
              UNIVERSAL_DOMAIN: process.env.UNIVERSAL_DOMAIN,
            } as ServiceAccount),
          });
        }
        return admin.app();
      },
    },
    FirebaseService,
  ],
  exports: ['FIREBASE', FirebaseService],
})
export class FirebaseModule {}
