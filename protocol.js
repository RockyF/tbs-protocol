/**
 * Created by rockyl on 2017/11/23.
 */

const ByteBuffer = require('bytebuffer');
const protobuf = require('./Protobuf');

let _protoIDMap;

exports.initWithConfig = function ({protoSchemas, protoIDMap}) {
	_protoIDMap = protoIDMap;

	return Promise.all(
		protoSchemas.map(protoSchema => {
			let {packageName} = protoSchema;
			if(protoSchema.hasOwnProperty('protoSource')){
				return protobuf.addProtoSource(packageName, protoSchema.protoSource);
			}else{
				return protobuf.addProtoFile(packageName, protoSchema.protoFile);
			}
		})
	);
}

exports.encode = function (messageName, message, cid = 0, eid = 0) {
	if (!message) {
		return false;
	}

	let pid = _protoIDMap[messageName];

	let pkgData = protobuf.encode({messageName, message});
	pkgData.offset = 0;

	let pkgBuffer = new ByteBuffer(pkgData.length + 10);
	pkgBuffer.writeUint16(pid);
	pkgBuffer.writeUint32(cid);
	pkgBuffer.writeUint32(eid);

	if (pkgData) {
		pkgBuffer.append(pkgData);
		//pkgBuffer = ByteBuffer.concat([pkgBuffer, pkgData]);
	} else {
		return false;
	}

	pkgBuffer.offset = 0;

	return {
		pid,
		messageName,
		message,
		cid,
		buffer: pkgBuffer.toBuffer(),
	};
}

exports.decode = function (bytes) {
	let buffer = ByteBuffer.wrap(bytes);
	let pid = buffer.readInt16(0);  //2
	let cid = buffer.readInt32(2);  //4
	let eid = buffer.readInt32(6);  //4

	let messageName = _protoIDMap[pid];

	let message;
	if (buffer.limit > 10) {
		buffer.offset = 10;
		message = protobuf.decode({messageName, bytes: new Uint8Array(buffer.toBuffer())});

		if (!message) {
			console.warn(`message named ${messageName} can't be decode`);
		}
	} else {
		message = {};
	}

	if (message) {
		return {
			pid,
			messageName,
			message,
			cid,
			eid,
			buffer: bytes,
		}
	}

	return;
}