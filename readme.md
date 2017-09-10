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

You can choose the currency you want to purchase by changing the `TO` environment variable. The following command will attempt to buy USD $ 100 worth of LTC.

```
TO=LTC node buy 50
```

You can choose the currency you want to spend using `FROM`. The following command will attempt to buy 0.5 BTC worth of ETH.

```
FROM=BTC TO=ETH node buy 0.5
```

You can define limits on how much you'd like to spend. The following command attempts to buy USD $ 500 worth of ETH, provided the market price for 1 ETH is somewhere between USD $ 200 and USD $ 800.

```
TO=ETH MIN=200 MAX=800 node buy 500
```

The `TO`, `FROM`, `MIN`, and `MAX` variables can be placed in `.env.json` or in `.env.defaults.json`.

# variables

Environment Variable  | Description                            | Default Value
----------------------|----------------------------------------|--------------------
`BITSTAMP_ACCOUNT_ID` | Your Bitstamp account ID               | `undefined`
`BITSTAMP_API_KEY`    | Your Bitstamp API key                  | `undefined`
`BITSTAMP_API_SECRET` | Your Bitstamp API secret               | `undefined`
`FROM`                | Currency you want to spend             | `'USD'`
`TO`                  | Currency you want to purchase          | `'BTC'`
`MIN`                 | Minimum acceptable market asking price | `2000`
`MAX`                 | Maximum acceptable market asking price | `8000`

# license

mit
