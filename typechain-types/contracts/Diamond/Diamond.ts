/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  BigNumberish,
  BytesLike,
  FunctionFragment,
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
} from "../../common";

export declare namespace IDiamondCut {
  export type FacetCutStruct = {
    facetAddress: AddressLike;
    action: BigNumberish;
    functionSelectors: BytesLike[];
  };

  export type FacetCutStructOutput = [
    facetAddress: string,
    action: bigint,
    functionSelectors: string[]
  ] & { facetAddress: string; action: bigint; functionSelectors: string[] };
}

export interface DiamondInterface extends Interface {
  getEvent(
    nameOrSignatureOrTopic:
      | "DiamondCut"
      | "DiamondDeployed"
      | "OwnershipTransferred"
  ): EventFragment;
}

export namespace DiamondCutEvent {
  export type InputTuple = [
    _diamondCut: IDiamondCut.FacetCutStruct[],
    _init: AddressLike,
    _calldata: BytesLike
  ];
  export type OutputTuple = [
    _diamondCut: IDiamondCut.FacetCutStructOutput[],
    _init: string,
    _calldata: string
  ];
  export interface OutputObject {
    _diamondCut: IDiamondCut.FacetCutStructOutput[];
    _init: string;
    _calldata: string;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace DiamondDeployedEvent {
  export type InputTuple = [owner: AddressLike, facetCount: BigNumberish];
  export type OutputTuple = [owner: string, facetCount: bigint];
  export interface OutputObject {
    owner: string;
    facetCount: bigint;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace OwnershipTransferredEvent {
  export type InputTuple = [previousOwner: AddressLike, newOwner: AddressLike];
  export type OutputTuple = [previousOwner: string, newOwner: string];
  export interface OutputObject {
    previousOwner: string;
    newOwner: string;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export interface Diamond extends BaseContract {
  connect(runner?: ContractRunner | null): Diamond;
  waitForDeployment(): Promise<this>;

  interface: DiamondInterface;

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

  getFunction<T extends ContractMethod = ContractMethod>(
    key: string | FunctionFragment
  ): T;

  getEvent(
    key: "DiamondCut"
  ): TypedContractEvent<
    DiamondCutEvent.InputTuple,
    DiamondCutEvent.OutputTuple,
    DiamondCutEvent.OutputObject
  >;
  getEvent(
    key: "DiamondDeployed"
  ): TypedContractEvent<
    DiamondDeployedEvent.InputTuple,
    DiamondDeployedEvent.OutputTuple,
    DiamondDeployedEvent.OutputObject
  >;
  getEvent(
    key: "OwnershipTransferred"
  ): TypedContractEvent<
    OwnershipTransferredEvent.InputTuple,
    OwnershipTransferredEvent.OutputTuple,
    OwnershipTransferredEvent.OutputObject
  >;

  filters: {
    "DiamondCut(tuple[],address,bytes)": TypedContractEvent<
      DiamondCutEvent.InputTuple,
      DiamondCutEvent.OutputTuple,
      DiamondCutEvent.OutputObject
    >;
    DiamondCut: TypedContractEvent<
      DiamondCutEvent.InputTuple,
      DiamondCutEvent.OutputTuple,
      DiamondCutEvent.OutputObject
    >;

    "DiamondDeployed(address,uint256)": TypedContractEvent<
      DiamondDeployedEvent.InputTuple,
      DiamondDeployedEvent.OutputTuple,
      DiamondDeployedEvent.OutputObject
    >;
    DiamondDeployed: TypedContractEvent<
      DiamondDeployedEvent.InputTuple,
      DiamondDeployedEvent.OutputTuple,
      DiamondDeployedEvent.OutputObject
    >;

    "OwnershipTransferred(address,address)": TypedContractEvent<
      OwnershipTransferredEvent.InputTuple,
      OwnershipTransferredEvent.OutputTuple,
      OwnershipTransferredEvent.OutputObject
    >;
    OwnershipTransferred: TypedContractEvent<
      OwnershipTransferredEvent.InputTuple,
      OwnershipTransferredEvent.OutputTuple,
      OwnershipTransferredEvent.OutputObject
    >;
  };
}
