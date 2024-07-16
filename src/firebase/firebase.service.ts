import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';

const CONVERSATION_LIMIT = 1;
const MESSAGE_LIMIT = 10;

@Injectable()
export class FirebaseService {
  private db: admin.firestore.Firestore;
  private auth: admin.auth.Auth;

  constructor() {
    this.db = admin.firestore();
    this.auth = admin.auth();
  }

  async verifyToken(idToken: string): Promise<admin.auth.DecodedIdToken> {
    try {
      const decodedToken = await this.auth.verifyIdToken(idToken);
      return decodedToken;
    } catch (error) {
      console.log('Error verifying ID token:', error);
      throw error;
    }
  }

  async getValue(collection: string, doc: string): Promise<any> {
    const snapshot = await this.db.collection(collection).doc(doc).get();
    return snapshot.data();
  }

  async getSpecificValue(
    collection: string,
    field: string,
    value: string,
  ): Promise<any> {
    // TODO: firestore doesn't allow partial search; they suggest using Algolia or ElasticSearch
    const snapshot = await this.db
      .collection(collection)
      .where(field, '==', value)
      .get();
    return snapshot.docs.map((doc) => doc.data());
  }

  async saveValue(
    collection: string,
    doc: string,
    value: Record<string, any>,
  ): Promise<void> {
    await this.db
      .collection(collection)
      .doc(doc)
      .set({
        ...value,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
  }

  async deleteValue(collection: string, doc: string): Promise<void> {
    await this.db.collection(collection).doc(doc).delete();
  }

  async updateValue(
    collection: string,
    doc: string,
    value: Record<string, any>,
  ): Promise<void> {
    await this.db
      .collection(collection)
      .doc(doc)
      .update({
        ...value,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
  }

  async updateSeveralValues(
    collection: string,
    docs: string[],
    values: Record<string, any>[],
  ): Promise<admin.firestore.WriteResult[]> {
    const batch = this.db.batch();
    await docs.forEach((doc, index) => {
      batch.update(this.db.collection(collection).doc(doc), values[index]);
    });
    return batch.commit();
  }

  async getUsersCollections(userIds: string[]): Promise<any> {
    const snapshot = await this.db
      .collection('users')
      .where('userId', 'in', userIds)
      .get();
    return snapshot.docs.map((doc) => doc.data());
  }

  async findParticipantConversation(
    userId: string,
    newUserId: string,
  ): Promise<any> {
    const conversationsSnapshot = await this.db
      .collection('conversations')
      .where('participantIds', 'array-contains', userId)
      .get();
    return conversationsSnapshot.docs.map((doc) => doc.data());
  }

  async getAllUserConversation(userId: string, date: Date): Promise<any> {
    const conversationsSnapshot = await this.db
      .collection('conversations')
      .where('participantIds', 'array-contains', userId)
      .count()
      .get();
    const conversationsCount = conversationsSnapshot.data().count;

    if (conversationsCount === 0)
      return { conversations: [], conversationsCount };

    const snapshot = await this.db
      .collection('conversations')
      .where('participantIds', 'array-contains', userId)
      .orderBy('createdAt', 'desc')
      .where('createdAt', '<', date)
      .limit(CONVERSATION_LIMIT)
      .get();

    return {
      conversations: snapshot.docs.map((doc) => doc.data()),
      conversationsCount,
    };
  }

  async getConversationMessages(conversationId: string, date: Date) {
    const messagesSnapshot = await this.db
      .collection('archiveMessages')
      .where('conversationId', '==', conversationId)
      .count()
      .get();

    const snapshot = await this.db
      .collection('archiveMessages')
      .where('conversationId', '==', conversationId)
      .orderBy('createdAt', 'desc')
      .where('createdAt', '<', date)
      .limit(MESSAGE_LIMIT)
      .get();
    return {
      messages: snapshot.docs.map((doc) => doc.data()),
      messageLength: messagesSnapshot.data().count,
    };
  }

  async getUserUnreadMessages(
    userId: string,
    conversationIds: string[],
  ): Promise<any> {
    const snapshot = await this.db
      .collection('archiveMessages')
      .where('unreadBy', 'array-contains', userId)
      .where('conversationId', 'in', conversationIds)
      .get();
    return snapshot.docs.map((doc) => doc.data());
  }
}
