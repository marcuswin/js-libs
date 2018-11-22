// Copyright 2015-2018 Parity Technologies (UK) Ltd.
// This file is part of Parity.

// Parity is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// Parity is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with Parity.  If not, see <http://www.gnu.org/licenses/>.

import BigNumber from 'bignumber.js';
import { isString } from '@parity/abi/lib/util/types';
import { toChecksumAddress } from '@parity/abi/lib/util/address';

import {
  AccountInfo,
  Block,
  ChainStatus,
  Condition,
  Histogram,
  HwAccountInfo,
  Log,
  NodeKind,
  Peer,
  Peers,
  Receipt,
  SignerRequest,
  SigningPayload,
  Syncing,
  Trace,
  TraceReplay,
  Transaction,
  VaultMeta
} from '../types';
import {
  SerializedAccountInfo,
  SerializedBlock,
  SerializedChainStatus,
  SerializedCondition,
  SerializedHistogram,
  SerializedHwAccountInfo,
  SerializedLog,
  SerializedPeer,
  SerializedPeers,
  SerializedReceipt,
  SerializedSignerRequest,
  SerializedSigningPayload,
  SerializedSyncing,
  SerializedTrace,
  SerializedTraceReplay,
  SerializedTransaction,
  SerializedVaultMeta
} from './types.serialized';

export function outAccountInfo (infos: SerializedAccountInfo) {
  return Object.keys(infos).reduce(
    (ret, _address) => {
      const info = infos[_address];
      const address = outAddress(_address);

      ret[address] = {
        name: info.name
      };

      if (info.meta) {
        ret[address].uuid = info.uuid;
        try {
          ret[address].meta = JSON.parse(info.meta);
        } catch (e) {
          console.error(
            `Couldn't parse meta field of JSON key file ${info.uuid}`
          );
        }
      }

      return ret;
    },
    {} as AccountInfo
  );
}

export function outAddress (address?: string) {
  return toChecksumAddress(address);
}

export function outAddresses (addresses: string[]) {
  return (addresses || []).map(outAddress);
}

export function outBlock (block: SerializedBlock) {
  const result: Block = {};

  if (block) {
    Object.keys(block).forEach(key => {
      switch (key) {
        case 'author':
        case 'miner':
          result[key] = outAddress(block[key]);
          break;

        case 'difficulty':
        case 'gasLimit':
        case 'gasUsed':
        case 'nonce':
        case 'number':
        case 'totalDifficulty':
          result[key] = outNumber(block[key]);
          break;

        case 'timestamp':
          result[key] = outDate(block[key]);
          break;
      }
    });
  }

  return result;
}

export function outChainStatus (status?: SerializedChainStatus) {
  const result: ChainStatus = {};
  if (status) {
    Object.keys(status).forEach(key => {
      switch (key) {
        case 'blockGap':
          result[key] = status[key]
            ? (status[key] as number[]).map(outNumber)
            : undefined;
          break;

        default:
          // @ts-ignore Here, we explicitly pass down extra keys, if they exist
          result[key] = status[key];
      }
    });
  }

  return result;
}

export function outDate (date?: number | string | Date) {
  if (date instanceof Date && typeof date.toISOString === 'function') {
    return date;
  }

  try {
    if (typeof date === 'string' && new Date(date).toISOString() === date) {
      return new Date(date);
    }
  } catch (error) {
    /* Do nothing */
  }

  return new Date(outNumber(date as number).toNumber() * 1000);
}

export function outHistogram (histogram: SerializedHistogram) {
  const result: Histogram = {};
  if (histogram) {
    Object.keys(histogram).forEach(key => {
      switch (key) {
        case 'bucketBounds':
        case 'counts':
          result[key] = histogram[key].map(outNumber);
          break;
      }
    });
  }

  return result;
}

export function outLog (log: SerializedLog) {
  const result: Log = {};
  Object.keys(log).forEach(key => {
    switch (key) {
      case 'blockNumber':
      case 'logIndex':
      case 'transactionIndex':
        result[key] = outNumber(log[key]);
        break;

      case 'address':
        result[key] = outAddress(log[key]);
        break;
    }
  });

  return result;
}

export function outHwAccountInfo (infos: SerializedHwAccountInfo) {
  return Object.keys(infos).reduce(
    (ret, _address) => {
      const address = outAddress(_address);

      ret[address] = infos[_address];

      return ret;
    },
    {} as HwAccountInfo
  );
}

export function outNodeKind (info: NodeKind) {
  return info;
}

export function outNumber (n?: string | number) {
  return new BigNumber(n || 0);
}

export function outPeer (peer: SerializedPeer) {
  const protocols = Object.keys(peer.protocols).reduce(
    (obj, key) => {
      if (peer.protocols[key]) {
        obj[key] = Object.assign({}, peer.protocols[key], {
          difficulty: outNumber(peer.protocols[key].difficulty)
        });
      }

      return obj;
    },
    {} as Peer
  );

  return Object.assign({}, peer, {
    protocols
  });
}

export function outPeers (peers: SerializedPeers) {
  return {
    active: outNumber(peers.active),
    connected: outNumber(peers.connected),
    max: outNumber(peers.max),
    peers: peers.peers.map(peer => outPeer(peer))
  } as Peers;
}

export function outPrivateReceipt (receipt: SerializedReceipt) {
  const result: Receipt = {};
  if (receipt) {
    Object.keys(receipt).forEach(key => {
      switch (key) {
        case 'status':
          result[key] = outNumber(receipt[key]);
          break;

        case 'contractAddress':
          result[key] = outAddress(receipt[key]);
          break;

        default:
          // @ts-ignore Here, we explicitly pass down extra keys, if they exist
          result[key] = log[key];
      }
    });
  }

  return result;
}

export function outReceipt (receipt: SerializedReceipt) {
  const result: Receipt = {};
  if (receipt) {
    Object.keys(receipt).forEach(key => {
      switch (key) {
        case 'blockNumber':
        case 'cumulativeGasUsed':
        case 'gasUsed':
        case 'transactionIndex':
          result[key] = outNumber(receipt[key]);
          break;

        case 'contractAddress':
          result[key] = outAddress(receipt[key]);
          break;

        default:
          // @ts-ignore Here, we explicitly pass down extra keys, if they exist
          result[key] = log[key];
      }
    });
  }

  return result;
}

export function outSignerRequest (request: SerializedSignerRequest) {
  const result: SignerRequest = {};

  if (request) {
    Object.keys(request).forEach(key => {
      switch (key) {
        case 'id':
          result[key] = outNumber(request[key]);
          break;

        case 'payload':
          result[key] = {};
          // @ts-ignore "Object is possibly 'undefined'." No it's not.
          result[key].decrypt = outSigningPayload(request[key].decrypt);
          // @ts-ignore "Object is possibly 'undefined'." No it's not.
          result[key].sign = outSigningPayload(request[key].sign);
          // @ts-ignore "Object is possibly 'undefined'." No it's not.
          result[key].signTransaction = outTransaction(
            // @ts-ignore "Object is possibly 'undefined'." No it's not.
            request[key].signTransaction
          );
          // @ts-ignore "Object is possibly 'undefined'." No it's not.
          result[key].sendTransaction = outTransaction(
            // @ts-ignore "Object is possibly 'undefined'." No it's not.
            request[key].sendTransaction
          );
          break;

        case 'origin':
          // @ts-ignore "Object is possibly 'undefined'." No it's not.
          const type = Object.keys(result[key])[0];
          // @ts-ignore "Object is possibly 'undefined'." No it's not.
          const details = result[key][type];

          request[key] = { type, details };
          break;
      }
    });
  }

  return result;
}

export function outSyncing (syncing: SerializedSyncing) {
  const result: Syncing = {};

  if (syncing && syncing !== 'false') {
    Object.keys(syncing).forEach(key => {
      switch (key) {
        case 'currentBlock':
        case 'highestBlock':
        case 'startingBlock':
        case 'warpChunksAmount':
        case 'warpChunksProcessed':
          result[key] = outNumber(syncing[key]);
          break;

        case 'blockGap':
          result[key] = syncing[key]
            ? (syncing[key] as number[]).map(outNumber)
            : undefined;
          break;
      }
    });
  }

  return syncing;
}

export function outTransactionCondition (
  condition?: SerializedCondition | null
) {
  const result: Condition = {};
  if (condition) {
    if (condition.block) {
      result.block = outNumber(condition.block);
    } else if (condition.time) {
      result.time = outDate(condition.time);
    }
  }

  return result;
}

export function outTransaction (tx: SerializedTransaction) {
  const result: Transaction = {};

  if (tx) {
    Object.keys(tx).forEach(key => {
      switch (key) {
        case 'blockNumber':
        case 'gasPrice':
        case 'gas':
        case 'nonce':
        case 'transactionIndex':
        case 'value':
          result[key] = outNumber(tx[key]);
          break;

        case 'condition':
          result[key] = outTransactionCondition(tx[key]);
          break;

        case 'creates':
        case 'from':
        case 'to':
          result[key] = outAddress(tx[key]);
          break;

        default:
          // @ts-ignore Here, we explicitly pass down extra keys, if they exist
          result[key] = log[key];
      }
    });
  }

  return result;
}

export function outSigningPayload (payload: SerializedSigningPayload) {
  const result: SigningPayload = {};
  if (payload) {
    Object.keys(payload).forEach(key => {
      switch (key) {
        case 'address':
          result[key] = outAddress(payload[key]);
          break;

        default:
          // @ts-ignore Here, we explicitly pass down extra keys, if they exist
          result[key] = log[key];
      }
    });
  }

  return payload;
}

export function outTrace (trace: SerializedTrace) {
  const result: Trace = {};
  if (trace) {
    if (trace.action) {
      result.action = {};
      Object.keys(trace.action).forEach(key => {
        switch (key) {
          case 'gas':
          case 'value':
          case 'balance':
            // @ts-ignore "Object is possibly 'undefined'." No it's not.
            result.action[key] = outNumber(trace.action[key]);
            break;

          case 'from':
          case 'to':
          case 'address':
          case 'refundAddress':
            // @ts-ignore "Object is possibly 'undefined'." No it's not.
            result.action[key] = outAddress(trace.action[key]);
            break;
        }
      });
    }

    if (trace.result) {
      result.result = {};
      Object.keys(trace.result).forEach(key => {
        switch (key) {
          case 'gasUsed':
            // @ts-ignore "Object is possibly 'undefined'." No it's not.
            result.result[key] = outNumber(trace.result[key]);
            break;

          case 'address':
            // @ts-ignore "Object is possibly 'undefined'." No it's not.
            result.action[key] = outAddress(trace.action[key]);
            break;
        }
      });
    }

    if (trace.traceAddress) {
      result.traceAddress = [];
      trace.traceAddress.forEach((address, index) => {
        // @ts-ignore "Object is possibly 'undefined'." No it's not.
        result.traceAddress[index] = outNumber(address);
      });
    }

    Object.keys(trace).forEach(key => {
      switch (key) {
        case 'subtraces':
        case 'transactionPosition':
        case 'blockNumber':
          result[key] = outNumber(trace[key]);
          break;
      }
    });
  }

  return result;
}

export function outTraces (traces?: SerializedTrace[]) {
  if (traces) {
    return traces.map(outTrace);
  }

  return traces;
}

export function outTraceReplay (trace: SerializedTraceReplay) {
  const result: TraceReplay = {};

  if (trace) {
    Object.keys(trace).forEach(key => {
      switch (key) {
        case 'trace':
          result[key] = outTraces(trace[key]);
          break;
      }
    });
  }

  return result;
}

export function outVaultMeta (meta: SerializedVaultMeta) {
  if (isString(meta)) {
    try {
      const obj = JSON.parse(meta);

      return obj as VaultMeta;
    } catch (error) {
      return {};
    }
  }

  return meta || {};
}
