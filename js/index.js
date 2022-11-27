/*! ChessInvert v1.0.1 lvbee.com.cn/ license */
function CNChessInvert(elem, btn, controll) {
	// 先把自己用变量储存起来,后面要用
	var myself = this;

	if (!window.$)
		throw new Error('need jquery.js');

	var $elem = $(elem), $startBtn = $(btn), $controll;
	$elem.addClass('layui-row box');
	var isStop = true;
	var x = 4, y = 8, curRole = null, uneatStep = 0;
	// 小于16的为红方，大于15的为黑方：
	var chessArray = ['兵', '兵', '兵', '兵', '兵', '车', '车', '马', '马', '相', '相', '仕', '仕', '帅', '炮', '炮',
		'卒', '卒', '卒', '卒', '卒', '车', '车', '马', '马', '象', '象', '士', '士', '将', '炮', '炮'];

	// 象棋的棋子共三十二个，分为红黑两组，各十六个，由对弈双方各执一组，每组兵种是一样的，各分为七种：
	// 红方：帅、仕、相、车、马、炮、兵
	// 黑方：将、士、象、车、马、炮、卒
	// 其中帅与将、仕与士、相与象、兵与卒的作用完全相同，仅仅是为了区分红棋和黑棋。

	// 1.先默认显示1-8类数字，以示规则：
	myself.init = function() {
		$elem.html('');

		if ($(window).width() < 520) {
			x = 8;
			y = 4;
			console.log(x, y);
		}

		for (var i = 0; i < x * y; i++) {
			$elem.append('<div class="layui-col-xs1 box-item" ' + getItemStyle(i) + '><div data-role>&nbsp;</div></div>');
		}
		curRole = null;
		uneatStep = 0;
		if (controll == true) {
			var html = [], _w = x > y ? 280 : 560;
			html.push('<div class="kk" style="margin:0 auto;width: ' + _w + 'px;height:auto;font-size:16px;padding-top:15px;height:40px;">');
			html.push('<div class="kk_time" style="float:left;width:33.333%;text-align: left;height:40px;">耗时：<span>0</span> 秒</div>');
			html.push('<div class="kk_step" style="float:left;width:33.333%;text-align: center;height:40px;">步数：<span>0</span> 步</div>');
			html.push('<div class="kk_role" style="float:left;width:33.333%;text-align: right;height:40px;">请翻棋</div>');
			html.push('</div>');
			$elem.after(html.join('\n'));
			$controll = $elem.next('div');
		} else if (controll && controll != false) {
			$controll = $(controll);
		}
		$elem.after('<audio src="./mp3/fall.mp3" class="audio-fall"></audio>');
		$elem.after('<audio src="./mp3/eat.mp3" class="audio-eat"></audio>');
		// 添加事件：
		addEventListener();
	}

	// 2.重新、开始
	myself.restart = function() {
		var array = getTempArray();
		$elem.find('.box-item').remove();
		$.each(array, function(i, number) {
			var html = '<div class="layui-col-xs1 box-item" ' + getItemStyle(i) + ' data-row="' + i + '"><div data-role="' + (number < 16 ? 0 : 1) + '" data-number="' + number
				+ '" class="un-invert"></div></div>';
			var $append = $elem.find('.box-item:last');
			if ($append && $append.length > 0) {
				$append.after(html);
			} else {
				$elem.append(html);
			}
		});
		curRole = null;
		uneatStep = 0;
		isStop = false;
		// 添加事件：
		addEventListener();
	}

	function getTempArray() {
		var array = [];
		for (var i = 0; i < x * y; i++)
			array.push(i);
		array.sort(function() {
			return Math.random() - 0.5;
		});
		return array;
	}

	function getItemStyle(row) {
		var w = 70, fs = 22;
		return 'style="width:' + w + 'px;height:' + w + 'px;line-height:' + w + 'px;font-size:' + (fs || 10) + 'px;"';
	}

	function msg(msg, isAlert) {
		if (window.layer)
			return isAlert ? layer.alert(msg) : layer.msg(msg);
		return alert(msg);
	}

	// 切换角色：
	function changeRoleMove(unFall) {
		curRole = curRole == 1 ? 0 : 1;
		if ($move && $move.length > 0)
			$move.addClass('selected');
		$move = null;
		if (!unFall)
			$elem.parent().find('.audio-fall')[0].play();

		// 判断是否结束：
		checkGameOver(true);

		if ($controll && !isStop) {
			if (myself.stepNum < 5200)
				myself.stepNum = parseInt(myself.stepNum) + 1;
			$controll.find('.kk_step>span').text(myself.stepNum);
			$controll.find('.kk_role').text(curRole == 0 ? '红棋下' : '黑旗下').attr('class', 'kk_role role-text-' + curRole);
			uneatStep++;
		} else if (isStop) {
			if (myself.timeInterval)
				window.clearInterval(myself.timeInterval);
			myself.stepNum = 0;
			myself.timeout = 0;
			// 这里不改显示，为了用户能看自己上次记录。
		}
	}

	var $move;
	function addEventListener() {
		// 板块
		$elem.find('.box-item').click(function() {
			if (isStop)
				return msg('请先点击开始游戏！');
			var $item = $(this), row = $item.attr('data-row');
			var $me = $item.find('div'), number = $me.attr('data-number');
			// 1.1-如果点击了空的，判断操作：
			if (!number && isNaN(number)) {
				if (!$move) // 没有操作对象
					return;
				var mRow = $move.parent().attr('data-row');
				console.log('是否能走：', mRow, row);
				if (!isNextDoor(mRow, row)) // 判断仅仅是上下左右关系，且相隔
					return;
				console.log('能走前进：', mRow, row);
				// 走，前进
				$item.html($move.clone());
				$move.parent().html('');
				// 显示痕迹：
				$elem.find('.invert').removeClass('selected');
				$me.addClass('selected');
				// 切换角色
				changeRoleMove(false);
				return;
			}
			// 2.1-点击了空棋子
			var text = $me.text(), role = $me.attr('data-role');
			// console.log($me, number, text);
			if (!text) {
				if (curRole == null) {
					curRole = role;// 第一次翻起就定下红黑方
					console.log('先手翻棋：', curRole);
				}
				// 在这里有可能炮盲打的动作：
				bk: if ($move) {
					var mSR = parseInt($move.attr('data-number')) % 16;
					if (mSR == 14 || mSR == 15) { // 的确是炮
						var mRow = $move.parent().attr('data-row');
						if (!isSpaceOneByLine(mRow, row))
							break bk; // 去翻棋
						// 先翻起来，再吃掉：
						$me.text(chessArray[number]).removeClass('un-invert').addClass('invert');
						setTimeout(function() {
							return eat($move, $me);
						}, 300);
						return;
					}
				}
				$elem.find('.invert').removeClass('selected');
				$me.addClass('selected');
				// 翻起来：
				$me.text(chessArray[number]).removeClass('un-invert').addClass('invert');
				// 切换角色：
				changeRoleMove();
				return;
			}
			// 3.1-点击了指定棋子：
			if (!$move) { // 第一次点击，或换角色时清掉了
				$elem.find('.invert').removeClass('selected');
				if (curRole != role) // 没到你下，不要点敌方棋子
					return $move = null;
				// 3.2-选中该棋子：
				$move = $me;
				$move.addClass('selected');
				return;
			}
			var mRow = $move.parent().attr('data-row');
			var mNumber = parseInt($move.attr('data-number'));
			// 4.1-前面点了，这时候又有，判断是不是同颜色的
			if ($move.attr('data-role') == role) {
				$elem.find('.invert').removeClass('selected');
				if (mNumber == number) {// 再次点击自己
					// 移除选中（解决炮盲打还是翻棋的冲突）
					$move = null;
					return;
				}
				// 如果是同颜色的，抛弃上一个
				$move = $me;
				$move.addClass('selected');
				return;
			}
			// 5.1-已经是不同颜色了，能不能吃：
			var mSR = mNumber % 16, nSR = number % 16;
			// 5.2-就在下一个格子：
			console.log('是否能吃：', mRow, row, mSR, nSR);
			if (isNextDoor(mRow, row)) {// 判断仅仅是上下左右关系，且相隔
				// 兵是特殊的
				if (nSR < 5 && mSR == 13)
					return console.log('将不能吃兵！');
				if (mSR < 5 && nSR == 13)
					return eat($move, $me); // 兵可以吃将
				if (mSR < 5 && nSR < 5)
					return eat($move, $me); //兵能吃兵
				console.log('邻居吃：', mSR, nSR);
				// 炮也是特殊的，
				if (mSR == 14 || mSR == 15) {
					return; //炮没有架子，啥也不能吃
				}
				if (nSR == 14 || nSR == 15) {
					if (mSR < 5 || mSR == 14 || mSR == 15)
						return; // 兵和炮不能吃炮
					return eat($move, $me); // 除了都可以吃炮
				}
				// 处理相同但序号不同的情况 5-12
				if (mSR >= 5 && mSR <= 12 && nSR >= 5 && nSR <= 12)
					mSR = mSR + (mSR - 4) % 2;//例如象9要变成10去吃相10
				// 其它棋子大吃小
				if (mSR >= nSR) // 相等也可以吃
					return eat($move, $me);

				return;
			}
			// 不是隔壁邻居，那只有炮是特殊的，其它不能直吃
			if (mSR == 14 || mSR == 15) {
				if (!isSpaceOneByLine(mRow, row))
					return;
				console.log('y.小炮飞起来吃...', mRow, row, mSR, nSR);
				return eat($move, $me);
			}
			// 其它情况
			return console.log('z.其它情况,不能跳着走呀...', mRow, row, mSR, nSR);
		});

		// 控制台
		if ($controll) {
			// 1.步数：
			myself.stepNum = 0;
			$controll.find('.kk_step>span').text(myself.stepNum);
			// 2.清除定时
			if (myself.timeInterval)
				window.clearInterval(myself.timeInterval);
			// 3.新定时
			myself.timeout = 0;
			$controll.find('.kk_time>span').text(myself.timeout);
			if (!isStop) { // 开始了
				myself.timeInterval = setInterval(function() {
					myself.timeout = parseInt(myself.timeout) + 1;
					if (myself.timeout > 60 * 60)
						window.clearInterval(myself.timeInterval);
					$controll.find('.kk_time>span').text(myself.timeout);
				}, 1000);
			}
		}

		// 按钮：
		if ($startBtn.length > 0) {
			$startBtn.text(isStop ? '开始游戏' : '重新开始');
			$startBtn.click(function() {
				myself.restart();
			});
		}
	}

	// 吃
	function eat($from, $to) {
		console.log($from.text(), '[吃]', $to.text());
		$to.parent().html($from.clone());
		$from.parent().html('');
		// 播放音效：
		$elem.parent().find('.audio-eat')[0].play();
		// 清空未吃
		uneatStep = 0;
		// 切换角色
		changeRoleMove(true);
	}

	// 是否一行间隔1个：（没处理好， 19 27 炮吃万物）
	function isSpaceOneByLine(srow, erow) {
		srow = parseInt(srow);
		erow = parseInt(erow);
		// 从左吃右，或从右吃左，判断逻辑一致：
		if (srow > erow) {
			var temp = srow;
			srow = erow;
			erow = temp;
		}
		var lineAddCn = 0;
		// 是否一行：
		if (parseInt(chuyu(srow, y)) == parseInt(chuyu(erow, y)))
			lineAddCn = 1;
		// 是否一列：
		if (srow % y == erow % y)
			lineAddCn = y;
		if (lineAddCn == 0)
			return false;
		// 一行或一列，判断逻辑一致，只是下一个跨度不一样而已：
		var spaceCn = 0; // 间隔数
		for (var i = srow + lineAddCn; i < erow; i += lineAddCn) {
			var $temp = $elem.find('.box-item[data-row="' + i + '"]');
			if (!$temp || $temp.length < 1) {
				console.error('error', i);
				return false;
			}
			$temp = $temp.find('[data-number]');
			if (!$temp || $temp.length < 1)
				continue; // 中间A是空的
			// 仅校验data-number，不管翻没翻起来；
			if (spaceCn > 1)
				return false;
			spaceCn++;
		}
		return spaceCn == 1;
	}

	// 是否上下左右，且相隔：（没处理好，13 21 兵不能吃兵）
	function isNextDoor(srow, erow) {
		srow = parseInt(srow);
		erow = parseInt(erow);
		// 上下：
		if (srow % y == erow % y) {
			// 不跨格子
			srow = parseInt(chuyu(srow, y)), erow = parseInt(chuyu(erow, y));
			if (srow > x || erow > x)
				throw new Error('超过4列，异常！');// 超过4列，异常
			return srow + 1 == erow || srow - 1 == erow;
		}
		srow++;
		erow++;
		// 左右角落：
		if ((srow % y == 0 && erow % y == 1) || (srow % y == 1 && erow % y == 0))
			return false;
		// 左右：
		return srow + 1 == erow || srow - 1 == erow;
	}

	function checkGameOver(isTips) {
		// a.还有没翻的，不结束！
		if ($elem.find('.un-invert').length > 0)
			return uneatStep = 0;

		// e.全局只有一种角色：（透视）
		if ($elem.find('[data-role="0"]').length < 1) {
			isStop = true;
			return msg('黑棋获胜！', true);
		}
		if ($elem.find('[data-role="1"]').length < 1) {
			isStop = true;
			return msg('红棋获胜！', true);
		}

		// f. 指定20步未吃子就平棋：
		if (uneatStep == 10) {
			return msg('20步未吃子会作为平棋，当前' + uneatStep + '步！');
		}

		// g. 指定20步未吃子就平棋：
		if (uneatStep > 20) {
			isStop = true;
			return msg('超过20步未吃子，作为平棋！', true);
		}
	}

	function chuyu(m, n) {
		return n == 0 ? 0 : m / n;
	}

	return myself.init();
}