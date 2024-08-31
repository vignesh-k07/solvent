/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/crowdfunding.json`.
 */
export type Crowdfunding = {
  "address": "DUKhKNcVXyU2DkziQ33W4ubF8DeGTvhvxcb4DaY1cJUk",
  "metadata": {
    "name": "crowdfunding",
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
          "name": "creator",
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
          "name": "targetAmount",
          "type": "u64"
        },
        {
          "name": "image",
          "type": "string"
        }
      ]
    },
    {
      "name": "getCampaign",
      "discriminator": [
        105,
        141,
        91,
        164,
        186,
        153,
        95,
        41
      ],
      "accounts": [
        {
          "name": "campaign"
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
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "invalidTargetAmount",
      "msg": "The target amount must be greater than 0."
    },
    {
      "code": 6001,
      "name": "titleTooLong",
      "msg": "The title is too long."
    },
    {
      "code": 6002,
      "name": "descriptionTooLong",
      "msg": "The description is too long."
    },
    {
      "code": 6003,
      "name": "imageTooLong",
      "msg": "The image URL is too long."
    }
  ],
  "types": [
    {
      "name": "campaign",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "title",
            "type": "string"
          },
          {
            "name": "description",
            "type": "string"
          },
          {
            "name": "targetAmount",
            "type": "u64"
          },
          {
            "name": "currentAmount",
            "type": "u64"
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
            "name": "creator",
            "type": "pubkey"
          },
          {
            "name": "image",
            "type": "string"
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
    }
  ]
};
