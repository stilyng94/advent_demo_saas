import { CompressionTypes, Kafka, Message, Producer, ProducerBatch, ProducerRecord, TopicMessages } from "kafkajs"
import avro from "avsc"

export const dataType = avro.Type.forSchema({
  type: "record",
  name: "",
  fields: [
    {
      name: "calendarEvent",
      type: { type: "enum", name: "calendarEvent", symbols: ["UPDATE", "DELETE", "CREATE"] }
    },
    {
      name: "data", type: { type: "int" }
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

    const records = await this.producer.send(data)
    console.log(records);

  }

  private createProducer(): Producer {
    const kafka = new Kafka({
      clientId: process.env.KAFKA_CLIENT_ID,
      brokers: [`${process.env.KAFKA_HOST}:${process.env.KAFKA_PORT}`]
    })

    return kafka.producer()
  }
}

const producer = new ProducerFactory()

export default producer