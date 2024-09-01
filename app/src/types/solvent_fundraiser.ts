/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/solvent_fundraiser.json`.
 */
export type SolventFundraiser = {
  "address": "AkGXFCnWivhLPY3qAY9973BV2XCLBv9UZKYM3YyENmV3",
  "metadata": {
    "name": "solventFundraiser",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "commitFunds",
      "discriminator": [
        242,
        226,
        172,
        204,
        143,
        241,
        207,
        248
      ],
      "accounts": [
        {
          "name": "matcher",
          "writable": true
        },
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "globalPool",
          "writable": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "createCampaign",
      "discriminator": [
        111,
        131,
        187,
        98,
        160,
        193,
        114,
        244
      ],
      "accounts": [
        {
          "name": "campaign",
          "writable": true,
          "signer": true
        },
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "title",
          "type": "string"
        },
        {
          "name": "description",
          "type": "string"
        },
        {
          "name": "target",
          "type": "u64"
        },
        {
          "name": "deadline",
          "type": "i64"
        },
        {
          "name": "image",
          "type": "string"
        }
      ]
    },
    {
      "name": "donateToCampaign",
      "discriminator": [
        11,
        213,
        34,
        2,
        196,
        121,
        15,
        216
      ],
      "accounts": [
        {
          "name": "campaign",
          "writable": true
        },
        {
          "name": "donor",
          "writable": true,
          "signer": true
        },
        {
          "name": "globalPool",
          "writable": true
        },
        {
          "name": "owner",
          "writable": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "getCampaigns",
      "discriminator": [
        1,
        39,
        82,
        120,
        13,
        66,
        218,
        232
      ],
      "accounts": [
        {
          "name": "campaignList",
          "writable": true
        }
      ],
      "args": [],
      "returns": {
        "vec": "pubkey"
      }
    },
    {
      "name": "initializeGlobalPool",
      "discriminator": [
        234,
        145,
        127,
        168,
        76,
        48,
        188,
        87
      ],
      "accounts": [
        {
          "name": "globalPool",
          "writable": true,
          "signer": true
        },
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "totalMatchingFunds",
          "type": "u64"
        }
      ]
    },
    {
      "name": "markInactive",
      "discriminator": [
        77,
        63,
        143,
        104,
        53,
        126,
        92,
        6
      ],
      "accounts": [
        {
          "name": "campaign",
          "writable": true
        },
        {
          "name": "owner",
          "writable": true,
          "signer": true
        }
      ],
      "args": []
    },
    {
      "name": "withdrawFunds",
      "discriminator": [
        241,
        36,
        29,
        111,
        208,
        31,
        104,
        217
      ],
      "accounts": [
        {
          "name": "campaign",
          "writable": true
        },
        {
          "name": "owner",
          "writable": true,
          "signer": true
        }
      ],
      "args": []
    },
    {
      "name": "withdrawUnmatchedFunds",
      "discriminator": [
        104,
        242,
        5,
        251,
        105,
        227,
        100,
        175
      ],
      "accounts": [
        {
          "name": "matcher",
          "writable": true
        },
        {
          "name": "owner",
          "writable": true,
          "signer": true
        },
        {
          "name": "globalPool",
          "writable": true
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "campaign",
      "discriminator": [
        50,
        40,
        49,
        11,
        157,
        220,
        229,
        192
      ]
    },
    {
      "name": "campaignList",
      "discriminator": [
        108,
        125,
        46,
        147,
        118,
        247,
        85,
        52
      ]
    },
    {
      "name": "globalPool",
      "discriminator": [
        162,
        244,
        124,
        37,
        148,
        94,
        28,
        50
      ]
    },
    {
      "name": "matcher",
      "discriminator": [
        76,
        0,
        38,
        226,
        23,
        130,
        67,
        35
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "notOwner",
      "msg": "You must be the owner of the campaign to withdraw funds."
    },
    {
      "code": 6001,
      "name": "campaignInactive",
      "msg": "The campaign is currently inactive or completed."
    },
    {
      "code": 6002,
      "name": "campaignAlreadyInactive",
      "msg": "The campaign is already inactive."
    },
    {
      "code": 6003,
      "name": "cannotWithdraw",
      "msg": "You cannot withdraw funds until the campaign is inactive or completed."
    },
    {
      "code": 6004,
      "name": "invalidDonationAmount",
      "msg": "Invalid donation amount. Amount must be greater than zero."
    },
    {
      "code": 6005,
      "name": "insufficientFunds",
      "msg": "Insufficient funds to make the donation."
    },
    {
      "code": 6006,
      "name": "noUnmatchedFunds",
      "msg": "No unmatched funds available to withdraw."
    }
  ],
  "types": [
    {
      "name": "campaign",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "title",
            "type": "string"
          },
          {
            "name": "description",
            "type": "string"
          },
          {
            "name": "target",
            "type": "u64"
          },
          {
            "name": "deadline",
            "type": "i64"
          },
          {
            "name": "amountCollected",
            "type": "u64"
          },
          {
            "name": "totalMatched",
            "type": "u64"
          },
          {
            "name": "image",
            "type": "string"
          },
          {
            "name": "donators",
            "type": {
              "vec": "pubkey"
            }
          },
          {
            "name": "donations",
            "type": {
              "vec": "u64"
            }
          },
          {
            "name": "status",
            "type": {
              "defined": {
                "name": "campaignStatus"
              }
            }
          }
        ]
      }
    },
    {
      "name": "campaignList",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "campaigns",
            "type": {
              "vec": "pubkey"
            }
          }
        ]
      }
    },
    {
      "name": "campaignStatus",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "active"
          },
          {
            "name": "inactive"
          },
          {
            "name": "completed"
          }
        ]
      }
    },
    {
      "name": "globalPool",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "totalFunds",
            "type": "u64"
          },
          {
            "name": "matchers",
            "type": {
              "vec": {
                "defined": {
                  "name": "matcher"
                }
              }
            }
          }
        ]
      }
    },
    {
      "name": "matcher",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "totalContributed",
            "type": "u64"
          },
          {
            "name": "unmatchedFunds",
            "type": "u64"
          }
        ]
      }
    }
  ]
};
