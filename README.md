<div align="center">

<h2>Webux Cardano</h2>

<p>This library is specifically crafted for a particular use case.</p>

<p align="center">
  <a href="https://github.com/studiowebux/cardano/issues">Report Bug</a>
  ·
  <a href="https://github.com/studiowebux/cardano/issues">Request Feature</a>
</p>
</div>

---

## About

- **Transaction Builder:** Construct transactions with ease.
- **NFT Creation (CIP-25):** Mint Non-Fungible Tokens using CIP-25 standard.
- **Fungible Token Creation:** Create and manage Fungible Tokens.
- **Royalties Setup (CIP-27):** Implement royalties for tokens using CIP-27.
- **CIP-86 Initialization:** Partial implementation of CIP-86.
- **Add transaction metadata (CIP-20):** Add custom message to the transaction.
- **Quick Wallet Generation:** Create new wallets swiftly.
- **Utilities:** Includes helpful utilities to interact with CSL and Blockfrost API.
- **Examples & Tests:** Provides ample examples and tests for better understanding and debugging.
- **Cross-Environment Compatibility:** Functions smoothly across all Cardano environments, from local testnets to the mainnet.
- **Submit API Usage:** Utilizes Cardano Submit API for transaction submission.
- **Utxo Fetching:** Retrieves UTXOs using Blockfrost API (Might bring back DB Sync query).
- **Policy Creation:** Allows creating new policies.

### TODO

- [ ] Integrate CIP-8. (https://cips.cardano.org/cip/CIP-8)
- [ ] Finish CIP-86. (https://cips.cardano.org/cip/CIP-86)
- [ ] Receive UTXO from client wallet.
- [ ] Configure cardano network (Currently the example are hardcoded).
- [ ] Simplify, rename and JSDoc the whole codebase.
- [ ] Simplify the CIP/JSON Metadata format and inputs.
- [ ] Fix if possible the Multi Assets, Lock ADA and group to minimize locked ADA.
- [ ] Rename the receiver_address variable to use something more intuitive.
- [ ] Normalize number input and casting all at the same place
- [ ] Document the wallet variables and where to use what
- [ ] Normalize the asset_name (hex and standard) also with the blockfrost format,
      the user can put a normal string and the code will adjust.
- [ ] Add dummy check for the metadata (64 chars or less and required keys).
- [ ] Readd the DB Sync query to get the UTXOs.
- [ ] Test UTXOs received from the client.
- [ ] Implement ApiError everywhere

---

## Installation and Usage

1. Install deno: https://deno.com
2. `deno add @studiowebux/cardano`
3. Local Cardano Node: https://github.com/studiowebux/cardano-private-node
4. Cardano Indexer: https://github.com/studiowebux/cardano-indexer


see `__tests__/*.test.ts` and `examples/` for examples.

---

### Releases and Github Actions

```bash
git tag -a X.Y.Z -m "Version X.Y.Z"
git push origin tags/X.Y.Z
```

---

## Contributing

1. Fork the project
2. Create a Feature Branch
3. Commit your changes
4. Push your changes
5. Create a PR

<details>
<summary>Working with your local branch</summary>

**Branch Checkout:**

```bash
git checkout -b <feature|fix|release|chore|hotfix>/prefix-name
```

> Your branch name must starts with [feature|fix|release|chore|hotfix] and use a / before the name;
> Use hyphens as separator;
> The prefix correspond to your Kanban tool id (e.g. abc-123)

**Keep your branch synced:**

```bash
git fetch origin
git rebase origin/master
```

**Commit your changes:**

```bash
git add .
git commit -m "<feat|ci|test|docs|build|chore|style|refactor|perf|BREAKING CHANGE>: commit message"
```

> Follow this convention commitlint for your commit message structure

**Push your changes:**

```bash
git push origin <feature|fix|release|chore|hotfix>/prefix-name
```

**Examples:**

```bash
git checkout -b release/v1.15.5
git checkout -b feature/abc-123-something-awesome
git checkout -b hotfix/abc-432-something-bad-to-fix
```

```bash
git commit -m "docs: added awesome documentation"
git commit -m "feat: added new feature"
git commit -m "test: added tests"
```

</details>

## License

Distributed under the MIT License. See LICENSE for more information.

## Contact

- Tommy Gingras @ tommy@studiowebux.com | Studio Webux

<div>
<b> | </b>
<a href="https://www.buymeacoffee.com/studiowebux" target="_blank"
      ><img
        src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png"
        alt="Buy Me A Coffee"
        style="height: 30px !important; width: 105px !important"
/></a>
<b> | </b>
<a href="https://webuxlab.com" target="_blank"
      ><img
        src="https://webuxlab-static.s3.ca-central-1.amazonaws.com/logoAmpoule.svg"
        alt="Webux Logo"
        style="height: 30px !important"
/> Webux Lab</a>
<b> | </b>
</div>
