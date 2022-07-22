import { CompressionTypes, Kafka, Message, Producer, ProducerBatch, ProducerRecord, TopicMessages } from "kafkajs"

import avro from "avsc"
import dotenv from "dotenv"

dotenv.config()


export const dataType = avro.Type.forSchema({
  type: "record",
  name: "calendarEventBody",
  fields: [
    {
      name: "event",
      type: { type: "enum", name: "eventType", symbols: ["UPDATE", "DELETE", "CREATE"] }
    },
    {
      name: "data", type: "int"
    }
  ]
})



class ProducerFactory {
  private producer: Producer

  constructor() {
    this.producer = this.createProducer()
  }

  public async start(): Promise<void> {
    try {
      await this.producer.connect()
    } catch (error) {
      console.log('Error connecting the producer: ', error)
    }
  }

  public async shutdown(): Promise<void> {
    await this.producer.disconnect()
  }

  public async sendBatch(messages: Array<string>): Promise<void> {
    const kafkaMessages: Array<Message> = messages.map((message) => {
      return {
        value: JSON.stringify(message)
      }
    })

    const topicMessages: TopicMessages = {
      topic: 'producer-topic',
      messages: kafkaMessages
    }

    const batch: ProducerBatch = {
      topicMessages: [topicMessages]
    }

    await this.producer.sendBatch(batch)
  }

  public async send(message: Buffer): Promise<void> {
    const kafkaMessage: Message = { value: message }

    const topicMessages: TopicMessages = {
      topic: 'producer-topic',
      messages: [kafkaMessage]
    }

    const data: ProducerRecord = {
      ...topicMessages, compression: CompressionTypes.GZIP,
    }

    await this.producer.send(data)
  }

  private createProducer(): Producer {
    const kafka = new Kafka({
      clientId: "hello",
      brokers: [`${process.env.KAFKA_HOST}:${process.env.KAFKA_PORT}`]
    })

    return kafka.producer()
  }
}

const producer = new ProducerFactory()

export default producer