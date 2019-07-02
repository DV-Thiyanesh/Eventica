var abiMultiSending= [
	{
		"constant": false,
		"inputs": [
			{
				"name": "_owners",
				"type": "address[]"
			},
			{
				"name": "_bbis",
				"type": "uint256[]"
			}
		],
		"name": "multiTransfer",
		"outputs": [
			{
				"name": "_success",
				"type": "bool"
			}
		],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "_newManager",
				"type": "address"
			}
		],
		"name": "addManager",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "_to",
				"type": "address"
			},
			{
				"name": "_qty",
				"type": "uint256"
			}
		],
		"name": "returnBBIS",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "_seeManager",
				"type": "address"
			}
		],
		"name": "isManager",
		"outputs": [
			{
				"name": "_isManager",
				"type": "bool"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"name": "_BBIAddress",
				"type": "address"
			}
		],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "constructor"
	}
]