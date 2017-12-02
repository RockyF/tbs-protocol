/**
 * Created by admin on 2017/6/19.
 */

const protobuf = require('protobufjs');

let protoRootMap = {};
let protoCache = {};

function getProto(name) {
	let proto = protoCache[name];
	let temp;
	if (!proto) {
		let arr = name.split('.');
		let packageName = arr[0];
		let messageName = arr[1];
		let protoRoot = protoRootMap[packageName];
		temp = protoRoot.lookup(messageName);
		if (temp) {
			proto = protoCache[name] = temp;
		}
	}
	if (!proto && !temp) {
		return null;
	}
	return proto;
}

exports.addProtoSource = function (packageName, protoSource) {
	let result = protobuf.parse(protoSource);
	protoRootMap[packageName] = result.root;

	return Promise.resolve();
}

exports.addProtoFile = function (packageName, protoFile) {
	return protobuf.load(protoFile).then(
		(root)=>{
			protoRootMap[packageName] = root;
		}
	)
}

exports.encode = function ({messageName, message}) {
	let proto = getProto(messageName);
	if (!proto) {
		return;
	}

	return proto.encode(message).finish();
}

exports.decode = function ({messageName, bytes}) {
	let proto = getProto(messageName);
	if (!proto) {
		return;
	}

	return proto.decode(bytes);
}
