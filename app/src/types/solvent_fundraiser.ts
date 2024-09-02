/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/solvent_fundraiser.json`.
 */
export type SolventFundraiser = {
  "address": "5HqykVFF3Gjo3iQYaCkmEQG7zqYaPNZC3nupXA5ndzs8",
  "metadata": {
    "name": "solventFundraiser",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
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
      "name": "setCampaignInactive",
      "discriminator": [
        220,
        157,
        160,
        173,
        170,
        177,
        151,
        228
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
      "name": "withdrawAtMilestone",
      "discriminator": [
        160,
        171,
        151,
        143,
        63,
        224,
        15,
        203
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
      "name": "withdrawRemainingFunds",
      "discriminator": [
        37,
        75,
        244,
        129,
        60,
        98,
        134,
        150
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
  "events": [
    {
      "name": "campaignStatusEvent",
      "discriminator": [
        24,
        215,
        71,
        0,
        12,
        254,
        205,
        250
      ]
    },
    {
      "name": "milestoneWithdrawalEvent",
      "discriminator": [
        191,
        242,
        125,
        233,
        201,
        220,
        68,
        98
      ]
    },
    {
      "name": "withdrawFundsEvent",
      "discriminator": [
        58,
        194,
        121,
        69,
        49,
        139,
        53,
        200
      ]
    },
    {
      "name": "withdrawUnmatchedFundsEvent",
      "discriminator": [
        235,
        242,
        86,
        244,
        122,
        11,
        35,
        1
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "campaignInactive",
      "msg": "Campaign is inactive."
    },
    {
      "code": 6001,
      "name": "invalidDonationAmount",
      "msg": "Invalid donation amount."
    },
    {
      "code": 6002,
      "name": "insufficientFunds",
      "msg": "Insufficient funds."
    },
    {
      "code": 6003,
      "name": "notOwner",
      "msg": "Not the owner of the campaign."
    },
    {
      "code": 6004,
      "name": "invalidMilestone",
      "msg": "Invalid milestone for withdrawal."
    },
    {
      "code": 6005,
      "name": "invalidStatus",
      "msg": "Campaign status is invalid for this operation."
    },
    {
      "code": 6006,
      "name": "noFundsAvailable",
      "msg": "No funds available for withdrawal."
    },
    {
      "code": 6007,
      "name": "cannotSetInactive",
      "msg": "Cannot set campaign to inactive from current status."
    },
    {
      "code": 6008,
      "name": "campaignNotInactive",
      "msg": "Campaign is not inactive."
    },
    {
      "code": 6009,
      "name": "noUnmatchedFunds",
      "msg": "No unmatched funds available for withdrawal."
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
          },
          {
            "name": "nextWithdrawalThreshold",
            "type": "u64"
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
      "name": "campaignStatusEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "campaign",
            "type": "pubkey"
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
    },
    {
      "name": "milestoneWithdrawalEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "campaign",
            "type": "pubkey"
          },
          {
            "name": "milestone",
            "type": "u64"
          },
          {
            "name": "amount",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "withdrawFundsEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "campaign",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "withdrawUnmatchedFundsEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "matcher",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          }
        ]
      }
    }
  ]
};
