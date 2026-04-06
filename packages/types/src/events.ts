// Kafka Event Type Definitions
// These interfaces define the shape of events published to Kafka topics.

export interface AssetUploadedEvent {
  eventId: string;
  timestamp: string;
  payload: {
    assetId: string;
    sellerId: string;
    fileName: string;
    fileType: string;
    fileSize: number;
    bucketKey: string;
  };
}

export interface AssetPurchasedEvent {
  eventId: string;
  timestamp: string;
  payload: {
    assetId: string;
    buyerId: string;
    sellerId: string;
    amount: number;
    currency: string;
    stripePaymentId: string;
  };
}

export interface UserRegisteredEvent {
  eventId: string;
  timestamp: string;
  payload: {
    userId: string;
    email: string;
    name: string;
  };
}

export type KafkaEvent = AssetUploadedEvent | AssetPurchasedEvent | UserRegisteredEvent;
