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
  DiamondLoupeFacet,
  DiamondLoupeFacetInterface,
} from "../../../contracts/Diamond/DiamondLoupeFacet";

const _abi = [
  {
    inputs: [],
    name: "diamondLoupeFacetVersion",
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
  {
    inputs: [
      {
        internalType: "bytes4",
        name: "_functionSelector",
        type: "bytes4",
      },
    ],
    name: "facetAddress",
    outputs: [
      {
        internalType: "address",
        name: "facetAddress_",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "facetAddresses",
    outputs: [
      {
        internalType: "address[]",
        name: "facetAddresses_",
        type: "address[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "facetCount",
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
        name: "_facet",
        type: "address",
      },
    ],
    name: "facetExists",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_facet",
        type: "address",
      },
    ],
    name: "facetFunctionSelectors",
    outputs: [
      {
        internalType: "bytes4[]",
        name: "facetFunctionSelectors_",
        type: "bytes4[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "facets",
    outputs: [
      {
        components: [
          {
            internalType: "address",
            name: "facetAddress",
            type: "address",
          },
          {
            internalType: "bytes4[]",
            name: "functionSelectors",
            type: "bytes4[]",
          },
        ],
        internalType: "struct IDiamondLoupe.Facet[]",
        name: "facets_",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes4",
        name: "_functionSelector",
        type: "bytes4",
      },
    ],
    name: "functionExists",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getDiamondInfo",
    outputs: [
      {
        internalType: "uint256",
        name: "facetCount_",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "functionCount",
        type: "uint256",
      },
      {
        internalType: "address[]",
        name: "facetAddresses_",
        type: "address[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes4",
        name: "_interfaceId",
        type: "bytes4",
      },
    ],
    name: "supportsInterface",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalFunctionSelectors",
    outputs: [
      {
        internalType: "uint256",
        name: "total",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

const _bytecode =
  "0x6080604052348015600f57600080fd5b506109768061001f6000396000f3fe608060405234801561001057600080fd5b50600436106100995760003560e01c806301ffc9a71461009e5780634258afa0146100c657806349fb4345146100ed57806352ef6b2c146101035780637a0ed627146101185780638abf4c141461012d5780639430c07314610144578063adfca15e14610157578063bbd644a514610177578063cdffacc61461018a578063f3fa624d146101b5575b600080fd5b6100b16100ac3660046106be565b6101bd565b60405190151581526020015b60405180910390f35b60408051808201825260058152640312e302e360dc1b602082015290516100bd91906106ef565b6100f56101ee565b6040519081526020016100bd565b61010b610203565b6040516100bd9190610782565b61012061026f565b6040516100bd9190610795565b61013561040c565b6040516100bd9392919061084f565b6100b1610152366004610877565b6104e3565b61016a610165366004610877565b610512565b6040516100bd91906108a0565b6100b16101853660046106be565b6105bc565b61019d6101983660046106be565b6105f3565b6040516001600160a01b0390911681526020016100bd565b6100f5610628565b6000806101c861069a565b6001600160e01b0319909316600090815260039093016020525050604090205460ff1690565b6000806101f961069a565b6002015492915050565b6060600061020f61069a565b6002810180546040805160208084028201810190925282815293945083018282801561026457602002820191906000526020600020905b81546001600160a01b03168152600190910190602001808311610246575b505050505091505090565b6060600061027b61069a565b6002810154909150806001600160401b0381111561029b5761029b6108ed565b6040519080825280602002602001820160405280156102e157816020015b6040805180820190915260008152606060208201528152602001906001900390816102b95790505b50925060005b8181101561040657600083600201828154811061030657610306610903565b9060005260206000200160009054906101000a90046001600160a01b031690508085838151811061033957610339610903565b6020908102919091018101516001600160a01b0392831690529082166000908152600186018252604090819020805482518185028101850190935280835291929091908301828280156103d857602002820191906000526020600020906000905b82829054906101000a900460e01b6001600160e01b0319168152602001906004019060208260030104928301926001038202915080841161039a5790505b50505050508583815181106103ef576103ef610903565b6020908102919091018101510152506001016102e7565b50505090565b6000806060600061041b61069a565b6002810180546040805160208084028201810190925282815291975092935091869083018282801561047657602002820191906000526020600020905b81546001600160a01b03168152600190910190602001808311610458575b5050505050915060005b848110156104dc578160010160008360020183815481106104a3576104a3610903565b60009182526020808320909101546001600160a01b031683528201929092526040019020546104d29085610919565b9350600101610480565b5050909192565b6000806104ee61069a565b6001600160a01b039093166000908152600190930160205250506040902054151590565b6060600061051e61069a565b6001600160a01b038416600090815260018201602090815260409182902080548351818402810184019094528084529394509192908301828280156105af57602002820191906000526020600020906000905b82829054906101000a900460e01b6001600160e01b031916815260200190600401906020826003010492830192600103820291508084116105715790505b5050505050915050919050565b6000806105c761069a565b6001600160e01b03199093166000908152602093909352505060409020546001600160a01b0316151590565b6000806105fe61069a565b6001600160e01b03199093166000908152602093909352505060409020546001600160a01b031690565b60008061063361069a565b600281015490915060005b818110156104065782600101600084600201838154811061066157610661610903565b60009182526020808320909101546001600160a01b031683528201929092526040019020546106909085610919565b935060010161063e565b7f591a66cdc36a46902055fe7f9f195cd083ee999373b7ae1a10dcb19a6c1f59d190565b6000602082840312156106d057600080fd5b81356001600160e01b0319811681146106e857600080fd5b9392505050565b602081526000825180602084015260005b8181101561071d5760208186018101516040868401015201610700565b506000604082850101526040601f19601f83011684010191505092915050565b600081518084526020840193506020830160005b828110156107785781516001600160a01b0316865260209586019590910190600101610751565b5093949350505050565b6020815260006106e8602083018461073d565b6000602082016020835280845180835260408501915060408160051b86010192506020860160005b8281101561084357868503603f19018452815180516001600160a01b031686526020908101516040828801819052815190880181905291019060009060608801905b8083101561082b5783516001600160e01b031916825260209384019360019390930192909101906107ff565b509650505060209384019391909101906001016107bd565b50929695505050505050565b83815282602082015260606040820152600061086e606083018461073d565b95945050505050565b60006020828403121561088957600080fd5b81356001600160a01b03811681146106e857600080fd5b602080825282518282018190526000918401906040840190835b818110156108e25783516001600160e01b0319168352602093840193909201916001016108ba565b509095945050505050565b634e487b7160e01b600052604160045260246000fd5b634e487b7160e01b600052603260045260246000fd5b8082018082111561093a57634e487b7160e01b600052601160045260246000fd5b9291505056fea2646970667358221220092fd27ce8783ab356dfd742ee454a03ba5317e8959dadf8cfbeb1505f12623a64736f6c634300081c0033";

type DiamondLoupeFacetConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: DiamondLoupeFacetConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class DiamondLoupeFacet__factory extends ContractFactory {
  constructor(...args: DiamondLoupeFacetConstructorParams) {
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
      DiamondLoupeFacet & {
        deploymentTransaction(): ContractTransactionResponse;
      }
    >;
  }
  override connect(runner: ContractRunner | null): DiamondLoupeFacet__factory {
    return super.connect(runner) as DiamondLoupeFacet__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): DiamondLoupeFacetInterface {
    return new Interface(_abi) as DiamondLoupeFacetInterface;
  }
  static connect(
    address: string,
    runner?: ContractRunner | null
  ): DiamondLoupeFacet {
    return new Contract(address, _abi, runner) as unknown as DiamondLoupeFacet;
  }
}
