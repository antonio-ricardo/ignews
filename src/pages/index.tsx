import { GetStaticProps } from "next"
import Head from "next/head"
import { SubscribeButton } from "../components/subscribeButton"
import { stripeApi } from "../services/stripe"
import styles from './styles.home.module.scss'

interface HomeProps {
  product: {
    priceId: string
    amount: number
  }
}

export default function Home({ product }: HomeProps) {
  return (
    <>
      <Head>
        <title>Inicio | IgNews</title>
      </Head>

      <main className={styles.mainContainer}>
        <section className={styles.mainContent}>
          <span>👏 Hey, welcome</span>

          <h1>News about <br />the <span>React</span> world.</h1>

          <p>
            Get acess to all the publications <br />

            <span>for {product.amount} month</span>
          </p>
          <SubscribeButton priceId={product.priceId} />
        </section>

        <img src="/avatar.svg" alt="girl coding" />
      </main>
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const price = await stripeApi.prices.retrieve('price_1MLobCIwoE4TjqlNHj0gL8Eo')

  const product = {
    priceId: price.id,
    amount: Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price.unit_amount as number / 100)
  }

  return {
    props: {
      product
    },
    revalidate: (60 * 60 * 24) // 24 hours
  }
}