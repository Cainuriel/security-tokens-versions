/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import {
  Contract,
  ContractFactory,
  ContractTransactionResponse,
  Interface,
} from "ethers";
import type { Signer, ContractDeployTransaction, ContractRunner } from "ethers";
import type { NonPayableOverrides } from "../../../common";
import type {
  ERC20Facet,
  ERC20FacetInterface,
} from "../../../contracts/Diamond/ERC20Facet";

const _abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "allowance",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "needed",
        type: "uint256",
      },
    ],
    name: "ERC20InsufficientAllowance",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "sender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "balance",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "needed",
        type: "uint256",
      },
    ],
    name: "ERC20InsufficientBalance",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "approver",
        type: "address",
      },
    ],
    name: "ERC20InvalidApprover",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "receiver",
        type: "address",
      },
    ],
    name: "ERC20InvalidReceiver",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "sender",
        type: "address",
      },
    ],
    name: "ERC20InvalidSender",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
    ],
    name: "ERC20InvalidSpender",
    type: "error",
  },
  {
    inputs: [],
    name: "ERC20TokenTransferPaused",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "recipient",
        type: "address",
      },
    ],
    name: "RecipientBlacklisted",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "recipient",
        type: "address",
      },
    ],
    name: "RecipientNotWhitelisted",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "sender",
        type: "address",
      },
    ],
    name: "SenderBlacklisted",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "sender",
        type: "address",
      },
    ],
    name: "SenderNotWhitelisted",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "Approval",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "Transfer",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
    ],
    name: "allowance",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "approve",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "balanceOf",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "decimals",
    outputs: [
      {
        internalType: "uint8",
        name: "",
        type: "uint8",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "subtractedValue",
        type: "uint256",
      },
    ],
    name: "decreaseAllowance",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "addedValue",
        type: "uint256",
      },
    ],
    name: "increaseAllowance",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "name",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "symbol",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalSupply",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "transfer",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "transferFrom",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "version",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
] as const;

const _bytecode =
  "0x6080604052348015600f57600080fd5b50610a318061001f6000396000f3fe608060405234801561001057600080fd5b50600436106100a45760003560e01c806306fdde03146100a9578063095ea7b3146100c757806318160ddd146100ea57806323b872dd14610100578063313ce56714610113578063395093511461012d57806354fd4d501461014057806370a082311461016157806395d89b4114610174578063a457c2d71461017c578063a9059cbb1461018f578063dd62ed3e146101a2575b600080fd5b6100b16101b5565b6040516100be919061082a565b60405180910390f35b6100da6100d5366004610894565b610250565b60405190151581526020016100be565b6100f2610267565b6040519081526020016100be565b6100da61010e3660046108be565b61027a565b61011b610309565b60405160ff90911681526020016100be565b6100da61013b366004610894565b61031f565b6040805180820190915260058152640312e302e360dc1b60208201526100b1565b6100f261016f3660046108fb565b61036d565b6100b1610396565b6100da61018a366004610894565b6103ae565b6100da61019d366004610894565b610418565b6100f26101b036600461091d565b610425565b60606101bf61045f565b60030180546101cd90610950565b80601f01602080910402602001604051908101604052809291908181526020018280546101f990610950565b80156102465780601f1061021b57610100808354040283529160200191610246565b820191906000526020600020905b81548152906001019060200180831161022957829003601f168201915b5050505050905090565b600061025d338484610483565b5060015b92915050565b600061027161045f565b60020154905090565b60008061028561045f565b6001600160a01b03861660009081526001820160209081526040808320338452909152902054909150838110156102de57338185604051637dc7a0d960e11b81526004016102d59392919061098a565b60405180910390fd5b6102e9868686610548565b6102fd86336102f887856109c1565b610483565b50600195945050505050565b600061031361045f565b6005015460ff16919050565b60008061032a61045f565b33600081815260018301602090815260408083206001600160a01b038a16845290915290205491925061036290866102f887856109d4565b506001949350505050565b600061037761045f565b6001600160a01b03909216600090815260209290925250604090205490565b60606103a061045f565b60040180546101cd90610950565b6000806103b961045f565b33600090815260018201602090815260408083206001600160a01b03891684529091529020549091508381101561040957848185604051637dc7a0d960e11b81526004016102d59392919061098a565b61036233866102f887856109c1565b600061025d338484610548565b600061042f61045f565b6001600160a01b039384166000908152600191909101602090815260408083209490951682529290925250205490565b7f10747f78c4ed48b23afd6119064f0748da54fb6a544d1f8f604eaf457d56867d90565b6001600160a01b0383166104ad57600060405163e602df0560e01b81526004016102d591906109e7565b6001600160a01b0382166104d7576000604051634a1406b160e11b81526004016102d591906109e7565b806104e061045f565b6001600160a01b038581166000818152600193909301602090815260408085209388168086529382529384902094909455915184815290927f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925910160405180910390a3505050565b6001600160a01b038316610572576000604051634b637e8f60e11b81526004016102d591906109e7565b6001600160a01b03821661059c57600060405163ec442f0560e01b81526004016102d591906109e7565b60006105a661045f565b600781015490915060ff16156105cf57604051631ed1889560e01b815260040160405180910390fd5b6001600160a01b0384166000908152600d8201602052604090205460ff1661060c578360405163bf3f938960e01b81526004016102d591906109e7565b6001600160a01b0384166000908152600e8201602052604090205460ff161561064a578360405163578f3e1360e01b81526004016102d591906109e7565b6001600160a01b0383166000908152600d8201602052604090205460ff166106875782604051632ac2e20360e21b81526004016102d591906109e7565b6001600160a01b0383166000908152600e8201602052604090205460ff16156106c557826040516332e38af360e21b81526004016102d591906109e7565b6001600160a01b038416600090815260208290526040902054828110156107055784818460405163391434e360e21b81526004016102d59392919061098a565b61070f83826109c1565b6001600160a01b0380871660009081526020859052604080822093909355908616815290812080548592906107459084906109d4565b92505081905550600182601001600082825461076191906109d4565b90915550506040805160a08101825260108401548082526001600160a01b0388811660208085018281528a8416868801818152606088018c81524260808a019081526000988952600f8d018652978a90209851895592516001890180549188166001600160a01b0319928316179055905160028901805491909716911617909455516003860155925160049094019390935592518681527fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef910160405180910390a35050505050565b602081526000825180602084015260005b81811015610858576020818601810151604086840101520161083b565b506000604082850101526040601f19601f83011684010191505092915050565b80356001600160a01b038116811461088f57600080fd5b919050565b600080604083850312156108a757600080fd5b6108b083610878565b946020939093013593505050565b6000806000606084860312156108d357600080fd5b6108dc84610878565b92506108ea60208501610878565b929592945050506040919091013590565b60006020828403121561090d57600080fd5b61091682610878565b9392505050565b6000806040838503121561093057600080fd5b61093983610878565b915061094760208401610878565b90509250929050565b600181811c9082168061096457607f821691505b60208210810361098457634e487b7160e01b600052602260045260246000fd5b50919050565b6001600160a01b039390931683526020830191909152604082015260600190565b634e487b7160e01b600052601160045260246000fd5b81810381811115610261576102616109ab565b80820180821115610261576102616109ab565b6001600160a01b039190911681526020019056fea264697066735822122083e6860bdde5b119950c5b2ad0cd0cf756547f44d9d78b9609598ff7cf2d705664736f6c634300081c0033";

type ERC20FacetConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: ERC20FacetConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class ERC20Facet__factory extends ContractFactory {
  constructor(...args: ERC20FacetConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override getDeployTransaction(
    overrides?: NonPayableOverrides & { from?: string }
  ): Promise<ContractDeployTransaction> {
    return super.getDeployTransaction(overrides || {});
  }
  override deploy(overrides?: NonPayableOverrides & { from?: string }) {
    return super.deploy(overrides || {}) as Promise<
      ERC20Facet & {
        deploymentTransaction(): ContractTransactionResponse;
      }
    >;
  }
  override connect(runner: ContractRunner | null): ERC20Facet__factory {
    return super.connect(runner) as ERC20Facet__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): ERC20FacetInterface {
    return new Interface(_abi) as ERC20FacetInterface;
  }
  static connect(address: string, runner?: ContractRunner | null): ERC20Facet {
    return new Contract(address, _abi, runner) as unknown as ERC20Facet;
  }
}
