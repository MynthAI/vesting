# Cardano Vesting Script

This is a CLI tool designed to facilitate the creation and unlocking of
time-locked Cardano script addresses. These script addresses allow for
the locking of assets until a specified expiration date, after which an
authorized address can unlock and access these assets.

## Features

  - **Generate time-locked script address**: Easily generate a new
    script address with a specified authorized address and expiration
    date.
  - **Unlock script address**: Unlock and access assets in a time-locked
    script address after the expiration date has passed.

## Requirements

To run this tool, you need to have Node.js installed on your system. You
can download and install Node.js from <https://nodejs.org/>.

## Installation

1.  Clone the repository or download the source code.
2.  Navigate to the root directory of the project.
3.  Install the dependencies using `npm install`

## Usage

After installing, you can run the tool from the command line within the
project directory via `npx vesting`. Refer to `npx vesting --help` for
more information. Below are the available commands and their
descriptions:

### Generate Time-Locked Script Address

Generates a new script address that is locked until the specified
expiration date.

**Syntax:**

    npx vesting generate <address> <expiration>

**Parameters:**

  - `<address>`: The address authorized to unlock the script.
  - `<expiration>`: The date the script becomes unlockable, in
    `YYYY-MM-DD` format.

**Example:**

    npx vesting generate addr_test1qre0ysdpg9u3tdx007xvucz68534vlvtjny6k207zy8njdhlzg67v9netpedfew28uuxrarehad57x5vvmuaq5ma6dvs8yphtc 2024-12-31

This will produce the following address:
`addr_test1zzlrdywstnp4mfemfaj0jy4lhcaj2aylezs73y7jjnyph98lzg67v9netpedfew28uuxrarehad57x5vvmuaq5ma6dvs9fzx0c`.
Any tokens sent to this address will be locked until 2024-12-31. After
2024-12-31, the user with the private key for
`addr_test1qre0ysdpg9u3tdx007xvucz68534vlvtjny6k207zy8njdhlzg67v9netpedfew28uuxrarehad57x5vvmuaq5ma6dvs8yphtc`
will be able to unlock the tokens.

### Unlock Script Address

Unlocks a previously generated time-locked script address.

**Syntax:**

    npx vesting unlock <address> <expiration>

**Parameters:**

  - `<address>`: The address authorized to unlock the script.
  - `<expiration>`: The expiration date used during the generation of
    the script, in `YYYY-MM-DD` format.

To build a transaction, you will require a
[Blockfrost](https://blockfrost.io/) API key defined in a
`BLOCKFROST_API_KEY` environment variable.

**Example:**

    npx vesting unlock addr_test1qre0ysdpg9u3tdx007xvucz68534vlvtjny6k207zy8njdhlzg67v9netpedfew28uuxrarehad57x5vvmuaq5ma6dvs8yphtc 2024-12-31

This will output transaction data that can be loaded into a wallet to be
signed and submitted to the Cardano blockchain.
