/**
 * Created by admin on 2017/6/19.
 */

const protobuf = require('protobufjs');

let protoRoot;
let protoCache = {};

function getProto(name) {
	let proto = protoCache[name];
	let temp;
	if (!proto) {
		temp = protoRoot.lookup(name);
		if (temp) {
			proto = protoCache[name] = temp;
		}
	}
	if (!proto && !temp) {
		return null;
	}
	return proto;
}

exports.initWithProtoSource = function (protoSource) {
	let result = protobuf.parse(protoSource);

	protoRoot = result.root;

	return Promise.resolve();
}

exports.initWithProtoFile = function (protoFile) {
	return protobuf.load(protoFile).then(
		(root)=>{
			protoRoot = root;
		}
	);
}

exports.encode = function ({messageName, data}) {
	let proto = getProto(messageName);
	if (!proto) {
		return;
	}

	return proto.encode(data).finish();
}

exports.decode = function ({messageName, bytes}) {
	let proto = getProto(messageName);
	if (!proto) {
		return;
	}

	return proto.decode(bytes);
}
