/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  BigNumberish,
  BytesLike,
  FunctionFragment,
  Result,
  Interface,
  EventFragment,
  AddressLike,
  ContractRunner,
  ContractMethod,
  Listener,
} from "ethers";
import type {
  TypedContractEvent,
  TypedDeferredTopicFilter,
  TypedEventLog,
  TypedLogDescription,
  TypedListener,
  TypedContractMethod,
} from "../common";

export declare namespace SecurityToken {
  export type TransactionRecordStruct = {
    id: BigNumberish;
    from: AddressLike;
    to: AddressLike;
    amount: BigNumberish;
    timestamp: BigNumberish;
  };

  export type TransactionRecordStructOutput = [
    id: bigint,
    from: string,
    to: string,
    amount: bigint,
    timestamp: bigint
  ] & {
    id: bigint;
    from: string;
    to: string;
    amount: bigint;
    timestamp: bigint;
  };
}

export interface SecurityTokenInterface extends Interface {
  getFunction(
    nameOrSignature:
      | "ADMIN_ROLE"
      | "DEFAULT_ADMIN_ROLE"
      | "MINTER_ROLE"
      | "PAUSER_ROLE"
      | "addToBlacklist"
      | "addToWhitelist"
      | "allowance"
      | "approve"
      | "balanceOf"
      | "blacklist"
      | "burn"
      | "burnFrom"
      | "cap"
      | "decimals"
      | "getRoleAdmin"
      | "getSecurityInfo"
      | "getTokenInfo"
      | "getTransactionRecord"
      | "grantRole"
      | "hasRole"
      | "initialize"
      | "instrumentType"
      | "isBlacklisted"
      | "isWhitelisted"
      | "isin"
      | "jurisdiction"
      | "mint"
      | "name"
      | "pause"
      | "paused"
      | "removeFromBlacklist"
      | "removeFromWhitelist"
      | "renounceRole"
      | "revertTransaction"
      | "revokeRole"
      | "supportsInterface"
      | "symbol"
      | "totalSupply"
      | "transactionCount"
      | "transfer"
      | "transferFrom"
      | "unpause"
      | "version"
      | "whitelist"
  ): FunctionFragment;

  getEvent(
    nameOrSignatureOrTopic:
      | "Approval"
      | "BlacklistAdded"
      | "BlacklistRemoved"
      | "Initialized"
      | "Paused"
      | "RoleAdminChanged"
      | "RoleGranted"
      | "RoleRevoked"
      | "TransactionReverted"
      | "Transfer"
      | "Unpaused"
      | "WhitelistAdded"
      | "WhitelistRemoved"
  ): EventFragment;

  encodeFunctionData(
    functionFragment: "ADMIN_ROLE",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "DEFAULT_ADMIN_ROLE",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "MINTER_ROLE",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "PAUSER_ROLE",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "addToBlacklist",
    values: [AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "addToWhitelist",
    values: [AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "allowance",
    values: [AddressLike, AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "approve",
    values: [AddressLike, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "balanceOf",
    values: [AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "blacklist",
    values: [AddressLike]
  ): string;
  encodeFunctionData(functionFragment: "burn", values: [BigNumberish]): string;
  encodeFunctionData(
    functionFragment: "burnFrom",
    values: [AddressLike, BigNumberish]
  ): string;
  encodeFunctionData(functionFragment: "cap", values?: undefined): string;
  encodeFunctionData(functionFragment: "decimals", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "getRoleAdmin",
    values: [BytesLike]
  ): string;
  encodeFunctionData(
    functionFragment: "getSecurityInfo",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getTokenInfo",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getTransactionRecord",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "grantRole",
    values: [BytesLike, AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "hasRole",
    values: [BytesLike, AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "initialize",
    values: [string, string, BigNumberish, string, string, string, AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "instrumentType",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "isBlacklisted",
    values: [AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "isWhitelisted",
    values: [AddressLike]
  ): string;
  encodeFunctionData(functionFragment: "isin", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "jurisdiction",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "mint",
    values: [AddressLike, BigNumberish]
  ): string;
  encodeFunctionData(functionFragment: "name", values?: undefined): string;
  encodeFunctionData(functionFragment: "pause", values?: undefined): string;
  encodeFunctionData(functionFragment: "paused", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "removeFromBlacklist",
    values: [AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "removeFromWhitelist",
    values: [AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "renounceRole",
    values: [BytesLike, AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "revertTransaction",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "revokeRole",
    values: [BytesLike, AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "supportsInterface",
    values: [BytesLike]
  ): string;
  encodeFunctionData(functionFragment: "symbol", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "totalSupply",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "transactionCount",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "transfer",
    values: [AddressLike, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "transferFrom",
    values: [AddressLike, AddressLike, BigNumberish]
  ): string;
  encodeFunctionData(functionFragment: "unpause", values?: undefined): string;
  encodeFunctionData(functionFragment: "version", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "whitelist",
    values: [AddressLike]
  ): string;

  decodeFunctionResult(functionFragment: "ADMIN_ROLE", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "DEFAULT_ADMIN_ROLE",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "MINTER_ROLE",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "PAUSER_ROLE",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "addToBlacklist",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "addToWhitelist",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "allowance", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "approve", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "balanceOf", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "blacklist", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "burn", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "burnFrom", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "cap", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "decimals", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "getRoleAdmin",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getSecurityInfo",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getTokenInfo",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getTransactionRecord",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "grantRole", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "hasRole", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "initialize", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "instrumentType",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "isBlacklisted",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "isWhitelisted",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "isin", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "jurisdiction",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "mint", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "name", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "pause", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "paused", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "removeFromBlacklist",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "removeFromWhitelist",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "renounceRole",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "revertTransaction",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "revokeRole", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "supportsInterface",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "symbol", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "totalSupply",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "transactionCount",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "transfer", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "transferFrom",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "unpause", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "version", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "whitelist", data: BytesLike): Result;
}

export namespace ApprovalEvent {
  export type InputTuple = [
    owner: AddressLike,
    spender: AddressLike,
    value: BigNumberish
  ];
  export type OutputTuple = [owner: string, spender: string, value: bigint];
  export interface OutputObject {
    owner: string;
    spender: string;
    value: bigint;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace BlacklistAddedEvent {
  export type InputTuple = [account: AddressLike, admin: AddressLike];
  export type OutputTuple = [account: string, admin: string];
  export interface OutputObject {
    account: string;
    admin: string;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace BlacklistRemovedEvent {
  export type InputTuple = [account: AddressLike, admin: AddressLike];
  export type OutputTuple = [account: string, admin: string];
  export interface OutputObject {
    account: string;
    admin: string;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace InitializedEvent {
  export type InputTuple = [version: BigNumberish];
  export type OutputTuple = [version: bigint];
  export interface OutputObject {
    version: bigint;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace PausedEvent {
  export type InputTuple = [account: AddressLike];
  export type OutputTuple = [account: string];
  export interface OutputObject {
    account: string;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace RoleAdminChangedEvent {
  export type InputTuple = [
    role: BytesLike,
    previousAdminRole: BytesLike,
    newAdminRole: BytesLike
  ];
  export type OutputTuple = [
    role: string,
    previousAdminRole: string,
    newAdminRole: string
  ];
  export interface OutputObject {
    role: string;
    previousAdminRole: string;
    newAdminRole: string;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace RoleGrantedEvent {
  export type InputTuple = [
    role: BytesLike,
    account: AddressLike,
    sender: AddressLike
  ];
  export type OutputTuple = [role: string, account: string, sender: string];
  export interface OutputObject {
    role: string;
    account: string;
    sender: string;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace RoleRevokedEvent {
  export type InputTuple = [
    role: BytesLike,
    account: AddressLike,
    sender: AddressLike
  ];
  export type OutputTuple = [role: string, account: string, sender: string];
  export interface OutputObject {
    role: string;
    account: string;
    sender: string;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace TransactionRevertedEvent {
  export type InputTuple = [transactionId: BigNumberish, admin: AddressLike];
  export type OutputTuple = [transactionId: bigint, admin: string];
  export interface OutputObject {
    transactionId: bigint;
    admin: string;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace TransferEvent {
  export type InputTuple = [
    from: AddressLike,
    to: AddressLike,
    value: BigNumberish
  ];
  export type OutputTuple = [from: string, to: string, value: bigint];
  export interface OutputObject {
    from: string;
    to: string;
    value: bigint;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace UnpausedEvent {
  export type InputTuple = [account: AddressLike];
  export type OutputTuple = [account: string];
  export interface OutputObject {
    account: string;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace WhitelistAddedEvent {
  export type InputTuple = [account: AddressLike, admin: AddressLike];
  export type OutputTuple = [account: string, admin: string];
  export interface OutputObject {
    account: string;
    admin: string;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace WhitelistRemovedEvent {
  export type InputTuple = [account: AddressLike, admin: AddressLike];
  export type OutputTuple = [account: string, admin: string];
  export interface OutputObject {
    account: string;
    admin: string;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export interface SecurityToken extends BaseContract {
  connect(runner?: ContractRunner | null): SecurityToken;
  waitForDeployment(): Promise<this>;

  interface: SecurityTokenInterface;

  queryFilter<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TypedEventLog<TCEvent>>>;
  queryFilter<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TypedEventLog<TCEvent>>>;

  on<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    listener: TypedListener<TCEvent>
  ): Promise<this>;
  on<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    listener: TypedListener<TCEvent>
  ): Promise<this>;

  once<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    listener: TypedListener<TCEvent>
  ): Promise<this>;
  once<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    listener: TypedListener<TCEvent>
  ): Promise<this>;

  listeners<TCEvent extends TypedContractEvent>(
    event: TCEvent
  ): Promise<Array<TypedListener<TCEvent>>>;
  listeners(eventName?: string): Promise<Array<Listener>>;
  removeAllListeners<TCEvent extends TypedContractEvent>(
    event?: TCEvent
  ): Promise<this>;

  ADMIN_ROLE: TypedContractMethod<[], [string], "view">;

  DEFAULT_ADMIN_ROLE: TypedContractMethod<[], [string], "view">;

  MINTER_ROLE: TypedContractMethod<[], [string], "view">;

  PAUSER_ROLE: TypedContractMethod<[], [string], "view">;

  addToBlacklist: TypedContractMethod<
    [account: AddressLike],
    [void],
    "nonpayable"
  >;

  addToWhitelist: TypedContractMethod<
    [account: AddressLike],
    [void],
    "nonpayable"
  >;

  allowance: TypedContractMethod<
    [owner: AddressLike, spender: AddressLike],
    [bigint],
    "view"
  >;

  approve: TypedContractMethod<
    [spender: AddressLike, value: BigNumberish],
    [boolean],
    "nonpayable"
  >;

  balanceOf: TypedContractMethod<[account: AddressLike], [bigint], "view">;

  blacklist: TypedContractMethod<[arg0: AddressLike], [boolean], "view">;

  burn: TypedContractMethod<[value: BigNumberish], [void], "nonpayable">;

  burnFrom: TypedContractMethod<
    [account: AddressLike, value: BigNumberish],
    [void],
    "nonpayable"
  >;

  cap: TypedContractMethod<[], [bigint], "view">;

  decimals: TypedContractMethod<[], [bigint], "view">;

  getRoleAdmin: TypedContractMethod<[role: BytesLike], [string], "view">;

  getSecurityInfo: TypedContractMethod<
    [],
    [
      [string, string, string] & {
        isin_: string;
        instrumentType_: string;
        jurisdiction_: string;
      }
    ],
    "view"
  >;

  getTokenInfo: TypedContractMethod<
    [],
    [
      [string, string, bigint, bigint, bigint] & {
        name_: string;
        symbol_: string;
        decimals_: bigint;
        totalSupply_: bigint;
        cap_: bigint;
      }
    ],
    "view"
  >;

  getTransactionRecord: TypedContractMethod<
    [id: BigNumberish],
    [SecurityToken.TransactionRecordStructOutput],
    "view"
  >;

  grantRole: TypedContractMethod<
    [role: BytesLike, account: AddressLike],
    [void],
    "nonpayable"
  >;

  hasRole: TypedContractMethod<
    [role: BytesLike, account: AddressLike],
    [boolean],
    "view"
  >;

  initialize: TypedContractMethod<
    [
      name: string,
      symbol: string,
      cap: BigNumberish,
      _isin: string,
      _instrumentType: string,
      _jurisdiction: string,
      admin: AddressLike
    ],
    [void],
    "nonpayable"
  >;

  instrumentType: TypedContractMethod<[], [string], "view">;

  isBlacklisted: TypedContractMethod<[account: AddressLike], [boolean], "view">;

  isWhitelisted: TypedContractMethod<[account: AddressLike], [boolean], "view">;

  isin: TypedContractMethod<[], [string], "view">;

  jurisdiction: TypedContractMethod<[], [string], "view">;

  mint: TypedContractMethod<
    [to: AddressLike, amount: BigNumberish],
    [void],
    "nonpayable"
  >;

  name: TypedContractMethod<[], [string], "view">;

  pause: TypedContractMethod<[], [void], "nonpayable">;

  paused: TypedContractMethod<[], [boolean], "view">;

  removeFromBlacklist: TypedContractMethod<
    [account: AddressLike],
    [void],
    "nonpayable"
  >;

  removeFromWhitelist: TypedContractMethod<
    [account: AddressLike],
    [void],
    "nonpayable"
  >;

  renounceRole: TypedContractMethod<
    [role: BytesLike, callerConfirmation: AddressLike],
    [void],
    "nonpayable"
  >;

  revertTransaction: TypedContractMethod<
    [transactionId: BigNumberish],
    [void],
    "nonpayable"
  >;

  revokeRole: TypedContractMethod<
    [role: BytesLike, account: AddressLike],
    [void],
    "nonpayable"
  >;

  supportsInterface: TypedContractMethod<
    [interfaceId: BytesLike],
    [boolean],
    "view"
  >;

  symbol: TypedContractMethod<[], [string], "view">;

  totalSupply: TypedContractMethod<[], [bigint], "view">;

  transactionCount: TypedContractMethod<[], [bigint], "view">;

  transfer: TypedContractMethod<
    [to: AddressLike, value: BigNumberish],
    [boolean],
    "nonpayable"
  >;

  transferFrom: TypedContractMethod<
    [from: AddressLike, to: AddressLike, value: BigNumberish],
    [boolean],
    "nonpayable"
  >;

  unpause: TypedContractMethod<[], [void], "nonpayable">;

  version: TypedContractMethod<[], [string], "view">;

  whitelist: TypedContractMethod<[arg0: AddressLike], [boolean], "view">;

  getFunction<T extends ContractMethod = ContractMethod>(
    key: string | FunctionFragment
  ): T;

  getFunction(
    nameOrSignature: "ADMIN_ROLE"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "DEFAULT_ADMIN_ROLE"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "MINTER_ROLE"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "PAUSER_ROLE"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "addToBlacklist"
  ): TypedContractMethod<[account: AddressLike], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "addToWhitelist"
  ): TypedContractMethod<[account: AddressLike], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "allowance"
  ): TypedContractMethod<
    [owner: AddressLike, spender: AddressLike],
    [bigint],
    "view"
  >;
  getFunction(
    nameOrSignature: "approve"
  ): TypedContractMethod<
    [spender: AddressLike, value: BigNumberish],
    [boolean],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "balanceOf"
  ): TypedContractMethod<[account: AddressLike], [bigint], "view">;
  getFunction(
    nameOrSignature: "blacklist"
  ): TypedContractMethod<[arg0: AddressLike], [boolean], "view">;
  getFunction(
    nameOrSignature: "burn"
  ): TypedContractMethod<[value: BigNumberish], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "burnFrom"
  ): TypedContractMethod<
    [account: AddressLike, value: BigNumberish],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "cap"
  ): TypedContractMethod<[], [bigint], "view">;
  getFunction(
    nameOrSignature: "decimals"
  ): TypedContractMethod<[], [bigint], "view">;
  getFunction(
    nameOrSignature: "getRoleAdmin"
  ): TypedContractMethod<[role: BytesLike], [string], "view">;
  getFunction(
    nameOrSignature: "getSecurityInfo"
  ): TypedContractMethod<
    [],
    [
      [string, string, string] & {
        isin_: string;
        instrumentType_: string;
        jurisdiction_: string;
      }
    ],
    "view"
  >;
  getFunction(
    nameOrSignature: "getTokenInfo"
  ): TypedContractMethod<
    [],
    [
      [string, string, bigint, bigint, bigint] & {
        name_: string;
        symbol_: string;
        decimals_: bigint;
        totalSupply_: bigint;
        cap_: bigint;
      }
    ],
    "view"
  >;
  getFunction(
    nameOrSignature: "getTransactionRecord"
  ): TypedContractMethod<
    [id: BigNumberish],
    [SecurityToken.TransactionRecordStructOutput],
    "view"
  >;
  getFunction(
    nameOrSignature: "grantRole"
  ): TypedContractMethod<
    [role: BytesLike, account: AddressLike],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "hasRole"
  ): TypedContractMethod<
    [role: BytesLike, account: AddressLike],
    [boolean],
    "view"
  >;
  getFunction(
    nameOrSignature: "initialize"
  ): TypedContractMethod<
    [
      name: string,
      symbol: string,
      cap: BigNumberish,
      _isin: string,
      _instrumentType: string,
      _jurisdiction: string,
      admin: AddressLike
    ],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "instrumentType"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "isBlacklisted"
  ): TypedContractMethod<[account: AddressLike], [boolean], "view">;
  getFunction(
    nameOrSignature: "isWhitelisted"
  ): TypedContractMethod<[account: AddressLike], [boolean], "view">;
  getFunction(
    nameOrSignature: "isin"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "jurisdiction"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "mint"
  ): TypedContractMethod<
    [to: AddressLike, amount: BigNumberish],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "name"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "pause"
  ): TypedContractMethod<[], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "paused"
  ): TypedContractMethod<[], [boolean], "view">;
  getFunction(
    nameOrSignature: "removeFromBlacklist"
  ): TypedContractMethod<[account: AddressLike], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "removeFromWhitelist"
  ): TypedContractMethod<[account: AddressLike], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "renounceRole"
  ): TypedContractMethod<
    [role: BytesLike, callerConfirmation: AddressLike],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "revertTransaction"
  ): TypedContractMethod<[transactionId: BigNumberish], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "revokeRole"
  ): TypedContractMethod<
    [role: BytesLike, account: AddressLike],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "supportsInterface"
  ): TypedContractMethod<[interfaceId: BytesLike], [boolean], "view">;
  getFunction(
    nameOrSignature: "symbol"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "totalSupply"
  ): TypedContractMethod<[], [bigint], "view">;
  getFunction(
    nameOrSignature: "transactionCount"
  ): TypedContractMethod<[], [bigint], "view">;
  getFunction(
    nameOrSignature: "transfer"
  ): TypedContractMethod<
    [to: AddressLike, value: BigNumberish],
    [boolean],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "transferFrom"
  ): TypedContractMethod<
    [from: AddressLike, to: AddressLike, value: BigNumberish],
    [boolean],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "unpause"
  ): TypedContractMethod<[], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "version"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "whitelist"
  ): TypedContractMethod<[arg0: AddressLike], [boolean], "view">;

  getEvent(
    key: "Approval"
  ): TypedContractEvent<
    ApprovalEvent.InputTuple,
    ApprovalEvent.OutputTuple,
    ApprovalEvent.OutputObject
  >;
  getEvent(
    key: "BlacklistAdded"
  ): TypedContractEvent<
    BlacklistAddedEvent.InputTuple,
    BlacklistAddedEvent.OutputTuple,
    BlacklistAddedEvent.OutputObject
  >;
  getEvent(
    key: "BlacklistRemoved"
  ): TypedContractEvent<
    BlacklistRemovedEvent.InputTuple,
    BlacklistRemovedEvent.OutputTuple,
    BlacklistRemovedEvent.OutputObject
  >;
  getEvent(
    key: "Initialized"
  ): TypedContractEvent<
    InitializedEvent.InputTuple,
    InitializedEvent.OutputTuple,
    InitializedEvent.OutputObject
  >;
  getEvent(
    key: "Paused"
  ): TypedContractEvent<
    PausedEvent.InputTuple,
    PausedEvent.OutputTuple,
    PausedEvent.OutputObject
  >;
  getEvent(
    key: "RoleAdminChanged"
  ): TypedContractEvent<
    RoleAdminChangedEvent.InputTuple,
    RoleAdminChangedEvent.OutputTuple,
    RoleAdminChangedEvent.OutputObject
  >;
  getEvent(
    key: "RoleGranted"
  ): TypedContractEvent<
    RoleGrantedEvent.InputTuple,
    RoleGrantedEvent.OutputTuple,
    RoleGrantedEvent.OutputObject
  >;
  getEvent(
    key: "RoleRevoked"
  ): TypedContractEvent<
    RoleRevokedEvent.InputTuple,
    RoleRevokedEvent.OutputTuple,
    RoleRevokedEvent.OutputObject
  >;
  getEvent(
    key: "TransactionReverted"
  ): TypedContractEvent<
    TransactionRevertedEvent.InputTuple,
    TransactionRevertedEvent.OutputTuple,
    TransactionRevertedEvent.OutputObject
  >;
  getEvent(
    key: "Transfer"
  ): TypedContractEvent<
    TransferEvent.InputTuple,
    TransferEvent.OutputTuple,
    TransferEvent.OutputObject
  >;
  getEvent(
    key: "Unpaused"
  ): TypedContractEvent<
    UnpausedEvent.InputTuple,
    UnpausedEvent.OutputTuple,
    UnpausedEvent.OutputObject
  >;
  getEvent(
    key: "WhitelistAdded"
  ): TypedContractEvent<
    WhitelistAddedEvent.InputTuple,
    WhitelistAddedEvent.OutputTuple,
    WhitelistAddedEvent.OutputObject
  >;
  getEvent(
    key: "WhitelistRemoved"
  ): TypedContractEvent<
    WhitelistRemovedEvent.InputTuple,
    WhitelistRemovedEvent.OutputTuple,
    WhitelistRemovedEvent.OutputObject
  >;

  filters: {
    "Approval(address,address,uint256)": TypedContractEvent<
      ApprovalEvent.InputTuple,
      ApprovalEvent.OutputTuple,
      ApprovalEvent.OutputObject
    >;
    Approval: TypedContractEvent<
      ApprovalEvent.InputTuple,
      ApprovalEvent.OutputTuple,
      ApprovalEvent.OutputObject
    >;

    "BlacklistAdded(address,address)": TypedContractEvent<
      BlacklistAddedEvent.InputTuple,
      BlacklistAddedEvent.OutputTuple,
      BlacklistAddedEvent.OutputObject
    >;
    BlacklistAdded: TypedContractEvent<
      BlacklistAddedEvent.InputTuple,
      BlacklistAddedEvent.OutputTuple,
      BlacklistAddedEvent.OutputObject
    >;

    "BlacklistRemoved(address,address)": TypedContractEvent<
      BlacklistRemovedEvent.InputTuple,
      BlacklistRemovedEvent.OutputTuple,
      BlacklistRemovedEvent.OutputObject
    >;
    BlacklistRemoved: TypedContractEvent<
      BlacklistRemovedEvent.InputTuple,
      BlacklistRemovedEvent.OutputTuple,
      BlacklistRemovedEvent.OutputObject
    >;

    "Initialized(uint64)": TypedContractEvent<
      InitializedEvent.InputTuple,
      InitializedEvent.OutputTuple,
      InitializedEvent.OutputObject
    >;
    Initialized: TypedContractEvent<
      InitializedEvent.InputTuple,
      InitializedEvent.OutputTuple,
      InitializedEvent.OutputObject
    >;

    "Paused(address)": TypedContractEvent<
      PausedEvent.InputTuple,
      PausedEvent.OutputTuple,
      PausedEvent.OutputObject
    >;
    Paused: TypedContractEvent<
      PausedEvent.InputTuple,
      PausedEvent.OutputTuple,
      PausedEvent.OutputObject
    >;

    "RoleAdminChanged(bytes32,bytes32,bytes32)": TypedContractEvent<
      RoleAdminChangedEvent.InputTuple,
      RoleAdminChangedEvent.OutputTuple,
      RoleAdminChangedEvent.OutputObject
    >;
    RoleAdminChanged: TypedContractEvent<
      RoleAdminChangedEvent.InputTuple,
      RoleAdminChangedEvent.OutputTuple,
      RoleAdminChangedEvent.OutputObject
    >;

    "RoleGranted(bytes32,address,address)": TypedContractEvent<
      RoleGrantedEvent.InputTuple,
      RoleGrantedEvent.OutputTuple,
      RoleGrantedEvent.OutputObject
    >;
    RoleGranted: TypedContractEvent<
      RoleGrantedEvent.InputTuple,
      RoleGrantedEvent.OutputTuple,
      RoleGrantedEvent.OutputObject
    >;

    "RoleRevoked(bytes32,address,address)": TypedContractEvent<
      RoleRevokedEvent.InputTuple,
      RoleRevokedEvent.OutputTuple,
      RoleRevokedEvent.OutputObject
    >;
    RoleRevoked: TypedContractEvent<
      RoleRevokedEvent.InputTuple,
      RoleRevokedEvent.OutputTuple,
      RoleRevokedEvent.OutputObject
    >;

    "TransactionReverted(uint256,address)": TypedContractEvent<
      TransactionRevertedEvent.InputTuple,
      TransactionRevertedEvent.OutputTuple,
      TransactionRevertedEvent.OutputObject
    >;
    TransactionReverted: TypedContractEvent<
      TransactionRevertedEvent.InputTuple,
      TransactionRevertedEvent.OutputTuple,
      TransactionRevertedEvent.OutputObject
    >;

    "Transfer(address,address,uint256)": TypedContractEvent<
      TransferEvent.InputTuple,
      TransferEvent.OutputTuple,
      TransferEvent.OutputObject
    >;
    Transfer: TypedContractEvent<
      TransferEvent.InputTuple,
      TransferEvent.OutputTuple,
      TransferEvent.OutputObject
    >;

    "Unpaused(address)": TypedContractEvent<
      UnpausedEvent.InputTuple,
      UnpausedEvent.OutputTuple,
      UnpausedEvent.OutputObject
    >;
    Unpaused: TypedContractEvent<
      UnpausedEvent.InputTuple,
      UnpausedEvent.OutputTuple,
      UnpausedEvent.OutputObject
    >;

    "WhitelistAdded(address,address)": TypedContractEvent<
      WhitelistAddedEvent.InputTuple,
      WhitelistAddedEvent.OutputTuple,
      WhitelistAddedEvent.OutputObject
    >;
    WhitelistAdded: TypedContractEvent<
      WhitelistAddedEvent.InputTuple,
      WhitelistAddedEvent.OutputTuple,
      WhitelistAddedEvent.OutputObject
    >;

    "WhitelistRemoved(address,address)": TypedContractEvent<
      WhitelistRemovedEvent.InputTuple,
      WhitelistRemovedEvent.OutputTuple,
      WhitelistRemovedEvent.OutputObject
    >;
    WhitelistRemoved: TypedContractEvent<
      WhitelistRemovedEvent.InputTuple,
      WhitelistRemovedEvent.OutputTuple,
      WhitelistRemovedEvent.OutputObject
    >;
  };
}
