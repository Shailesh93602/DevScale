/**
 * High-level schematic of a Message Queue Broker.
 * In a real-world scenario like Kafka, this would involve disk I/O, 
 * page cache management, and network protocol handling.
 */

interface Message {
  id: string;
  payload: any;
  timestamp: number;
}

class Topic {
  private partitions: Map<number, Message[]> = new Map();
  
  constructor(public name: string, numPartitions: number) {
    for (let i = 0; i < numPartitions; i++) {
        this.partitions.set(i, []);
    }
  }

  append(message: any, partitionKey?: string) {
    const partitionId = this.findPartition(partitionKey);
    const messages = this.partitions.get(partitionId)!;
    const msg: Message = {
        id: `${this.name}-${partitionId}-${messages.length}`,
        payload: message,
        timestamp: Date.now()
    };
    messages.push(msg);
    return msg;
  }

  getMessages(partitionId: number, offset: number, limit: number = 10): Message[] {
    const messages = this.partitions.get(partitionId) || [];
    return messages.slice(offset, offset + limit);
  }

  private findPartition(key?: string): number {
    if (!key) return 0;
    // Simple hash to determine partition
    let hash = 0;
    for (let i = 0; i < key.length; i++) hash += key.charCodeAt(i);
    return hash % this.partitions.size;
  }
}

class MessageQueue {
  private topics: Map<string, Topic> = new Map();

  createTopic(name: string, partitions: number = 3) {
    this.topics.set(name, new Topic(name, partitions));
  }

  produce(topicName: string, message: any, partitionKey?: string) {
    const topic = this.topics.get(topicName);
    if (!topic) throw new Error("Topic not found");
    return topic.append(message, partitionKey);
  }

  consume(topicName: string, partitionId: number, offset: number): Message[] {
    const topic = this.topics.get(topicName);
    if (!topic) return [];
    return topic.getMessages(partitionId, offset);
  }
}
