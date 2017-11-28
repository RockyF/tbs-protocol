/**
 * Created by rockyl on 2017/11/23.
 */

const ByteBuffer = require('bytebuffer');
const protobuf = require('./Protobuf');

let _protoIDMap;

exports.initWithConfig = function ({protoSource, protoFile, protoIDMap}) {
	_protoIDMap = protoIDMap;

	if (protoSource) {
		return protobuf.initWithProtoSource(protoSource);
	} else {
		return protobuf.initWithProtoFile(protoFile);
	}
}

exports.encode = function (messageName, message, cid = 0) {
	let pid = _protoIDMap[messageName];

	let pkgBuffer = new ByteBuffer();
	pkgBuffer.writeUint16(pid);
	pkgBuffer.writeUint32(cid, 2);

	if(!message){
		return false;
	}

	let pkgData = protobuf.encode({messageName, message});

	if (pkgData) {
		pkgBuffer = ByteBuffer.concat([pkgBuffer, pkgData], pkgBuffer.limit + pkgData.length);
	} else {
		return false;
	}

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
	if (buffer.limit > 12) {
		let pkgData = new Uint8Array(buffer.slice(10, buffer.limit).toBuffer());
		message = protobuf.decode({messageName, bytes: pkgData});

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