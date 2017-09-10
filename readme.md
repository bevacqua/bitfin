# bitfin

Utility to manage your Bitstamp account. You may put these scripts into cron jobs to do DCA (Dollar-Cost Averaging) on your cryptocurrency investments.

# setup

You'll need to provide the following environment variables. The API key pair can be created under the Security tab in your Bitstamp account.

- `BITSTAMP_ACCOUNT_ID`
- `BITSTAMP_API_KEY`
- `BITSTAMP_API_SECRET`

You can opt to place these in a JSON document named `.env.json` at the root of this repository's directory.

# `buy.js`

The following command will attempt to place a single market order to purchase USD $ 100 worth of BTC.

```
node buy 100
```

You can choose the currency you want to purchase by changing the `CURRENCY` environment variable. The following command will attempt to buy USD $ 100 worth of LTC.

```
CURRENCY=LTC node buy 50
```

You can define limits on how much you'd like to spend. The following command attempts to buy USD $ 500 worth of ETH, provided the market price for 1 ETH is somewhere between USD $ 200 and USD $ 800.

```
CURRENCY=ETH CURRENCY_MIN=200 CURRENCY_MAX=800 node buy 500
```

The `CURRENCY`, `CURRENCY_MIN`, and `CURRENCY_MAX` variables can be placed in `.env.json` or in `.env.defaults.json`.

# currencies supported

Not hardcoded in this package, depends on what Bitstamp supports, subject to changes by Bitstamp.

-BTC
-EUR
-XRP
-LTC
-ETH

# license

mit
