/**
 * Form 表单
 * 严格复刻 uview-plus pages/componentsC/form/form.nvue
 */
import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  UPActionSheet,
  UPButton,
  UPCalendar,
  UPCheckbox,
  UPCheckboxGroup,
  UPCode,
  UPDatetimePicker,
  UPForm,
  UPFormItem,
  UPIcon,
  UPInput,
  UPRadio,
  UPRadioGroup,
  UPTextarea,
  test,
  timeFormat,
  toast,
  type UPActionSheetAction,
  type UPCalendarDay,
  type UPCodeRef,
  type UPDatetimePickerPayload,
  type UPFormRef,
  type UPFormRules,
} from 'ultra-ui-rn';
import { DemoPage, Section } from '../_shared';

const actions: UPActionSheetAction[] = [{ name: '男' }, { name: '女' }, { name: '保密' }];
const radiolist1 = ['苹果', '香蕉', '毒橙子'];
const checkboxList1 = ['羽毛球', '跑步', '爬山'];

const rules: UPFormRules = {
  'userInfo.name': [
    { required: true, message: '请填写姓名', trigger: ['blur', 'change'] },
    {
      validator: (value) => test.chinese(String(value)),
      message: '姓名必须为中文',
      trigger: ['change', 'blur'],
    },
  ],
  'userInfo.sex': { max: 1, required: true, message: '请选择男或女', trigger: ['blur', 'change'] },
  'userInfo.birthday': { required: true, message: '请选择生日', trigger: ['change'] },
  checkboxValue1: { min: 2, required: true, message: '不能太宅，至少选两项', trigger: ['change'] },
  code: { required: true, min: 4, max: 4, message: '请填写4位验证码', trigger: ['blur'] },
  hotel: { min: 2, required: true, message: '请选择住店时间', trigger: ['change'] },
  intro: { min: 3, required: true, message: '不低于3个字', trigger: ['change'] },
  radiovalue1: { min: 1, max: 2, message: '橙子有毒', trigger: ['change'] },
};

const formatter = (day: UPCalendarDay): UPCalendarDay => {
  const now = new Date();
  if (day.month === now.getMonth() + 1 && day.day === now.getDate() + 3) {
    return { ...day, bottomInfo: '有优惠', dot: true };
  }
  return day;
};

export default function FormDemo() {
  const formRef = useRef<UPFormRef>(null);
  const codeRef = useRef<UPCodeRef>(null);
  const [name, setName] = useState('楼兰');
  const [sex, setSex] = useState('');
  const [age, setAge] = useState('0');
  const [birthday, setBirthday] = useState('');
  const [radiovalue1, setRadiovalue1] = useState<string | number | boolean>('苹果');
  const [checkboxValue1, setCheckboxValue1] = useState<Array<string | number | boolean>>([]);
  const [intro, setIntro] = useState('');
  const [hotel, setHotel] = useState('');
  const [code, setCode] = useState('');
  const [tips, setTips] = useState('');
  const [disabled1, setDisabled1] = useState(false);
  const [showSex, setShowSex] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showBirthday, setShowBirthday] = useState(false);

  const model = {
    checkboxValue1,
    code,
    hotel,
    intro,
    radiovalue1,
    userInfo: { age, birthday, name, sex },
  };

  // Upstream sets rules in onMounted via setRules for MP-WeChat compatibility.
  useEffect(() => {
    formRef.current?.setRules(rules);
  }, []);

  const sexSelect = (action: UPActionSheetAction) => {
    setSex(String(action.name ?? ''));
    setShowSex(false);
    void formRef.current?.validateField('userInfo.sex').catch(() => undefined);
  };

  const calendarConfirm = (dates: string[]) => {
    setShowCalendar(false);
    setHotel(`${dates[0]} / ${dates[dates.length - 1]}`);
    void formRef.current?.validateField('hotel').catch(() => undefined);
  };

  const birthdayConfirm = (payload: UPDatetimePickerPayload) => {
    setShowBirthday(false);
    setBirthday(timeFormat(payload.value, 'yyyy-mm-dd'));
    void formRef.current?.validateField('userInfo.birthday').catch(() => undefined);
  };

  const getCode = () => {
    toast.loading('正在获取验证码');
    setTimeout(() => {
      toast.hide();
      toast.default('验证码已发送');
      codeRef.current?.start();
    }, 2000);
  };

  const submit = () => {
    formRef.current?.validate()
      .then(() => toast.default('校验通过'))
      .catch(() => toast.default('校验失败'));
  };

  const reset = () => {
    formRef.current?.resetFields();
    formRef.current?.clearValidate();
    setTimeout(() => formRef.current?.clearValidate(), 10);
  };

  return (
    <DemoPage>
      <Section title="基础使用">
        <UPForm labelPosition="left" model={model} ref={formRef}>
          <UPFormItem borderBottom label="姓名" prop="userInfo.name">
            <UPInput border="none" onChange={setName} placeholder="姓名,只能为中文" value={name} />
          </UPFormItem>

          <UPFormItem
            borderBottom
            label="性别"
            onClick={() => setShowSex(true)}
            prop="userInfo.sex"
            right={<UPIcon name="arrow-right" />}
          >
            <UPInput border="none" disabled placeholder="请选择性别" value={sex} />
          </UPFormItem>

          <UPFormItem
            borderBottom
            label="年龄"
            prop="userInfo.age"
            rules={[{ required: true, message: '请填写年龄', trigger: ['blur', 'change'] }]}
          >
            <UPInput
              border="surround"
              clearable
              onChange={setAge}
              placeholder="请输入内容"
              type="number"
              value={age}
            />
          </UPFormItem>

          <UPFormItem borderBottom label="水果" prop="radiovalue1">
            <UPRadioGroup onChange={setRadiovalue1} value={radiovalue1}>
              {radiolist1.map((item) => (
                <UPRadio customStyle={s.inline} key={item} label={item} name={item} />
              ))}
            </UPRadioGroup>
          </UPFormItem>

          <UPFormItem borderBottom label="兴趣爱好" labelWidth="80" prop="checkboxValue1">
            <UPCheckboxGroup onChange={setCheckboxValue1} shape="square" value={checkboxValue1}>
              {checkboxList1.map((item) => (
                <UPCheckbox customStyle={s.inline} key={item} label={item} name={item} />
              ))}
            </UPCheckboxGroup>
          </UPFormItem>

          <UPFormItem borderBottom label="简介" prop="intro">
            <UPTextarea count onChange={setIntro} placeholder="不低于3个字" value={intro} />
          </UPFormItem>

          <UPFormItem
            borderBottom
            label="住店时间"
            labelWidth="80"
            onClick={() => setShowCalendar(true)}
            prop="hotel"
            right={<UPIcon name="arrow-right" />}
          >
            <UPInput border="none" disabled placeholder="请选择住店和离店时间" value={hotel} />
          </UPFormItem>

          <UPFormItem
            borderBottom
            label="验证码"
            labelWidth="80"
            prop="code"
            right={
              <UPButton
                customStyle={s.codeButton}
                disabled={disabled1}
                onClick={getCode}
                size="mini"
                text={tips}
                type="success"
              />
            }
          >
            <UPInput border="none" onChange={setCode} placeholder="请填写验证码" value={code} />
          </UPFormItem>

          <UPFormItem
            borderBottom
            label="生日"
            onClick={() => setShowBirthday(true)}
            prop="userInfo.birthday"
            right={<UPIcon name="arrow-right" />}
          >
            <UPInput border="none" disabled placeholder="请选择生日" value={birthday} />
          </UPFormItem>
        </UPForm>

        <UPButton customStyle={s.submit} onClick={submit} text="提交" type="primary" />
        <UPButton customStyle={s.reset} onClick={reset} text="重置" type="error" />

        <UPActionSheet
          actions={actions}
          description="如果选择保密会报错"
          onClose={() => setShowSex(false)}
          onSelect={sexSelect}
          show={showSex}
          title="请选择性别"
        />
        <UPCalendar
          confirmDisabledText="请选择离店日期"
          endText="离店"
          formatter={formatter}
          mode="range"
          onClose={() => setShowCalendar(false)}
          onConfirm={calendarConfirm}
          show={showCalendar}
          startText="住店"
        />
        <UPCode
          onChange={setTips}
          onEnd={() => setDisabled1(false)}
          onStart={() => setDisabled1(true)}
          ref={codeRef}
          seconds="20"
        />
        <UPDatetimePicker
          closeOnClickOverlay
          mode="date"
          onCancel={() => setShowBirthday(false)}
          onClose={() => setShowBirthday(false)}
          onConfirm={birthdayConfirm}
          show={showBirthday}
          value={Number(new Date())}
        />
      </Section>
    </DemoPage>
  );
}

const s = StyleSheet.create({
  codeButton: { flex: 0.5 },
  inline: { marginRight: 16 },
  reset: { marginTop: 10 },
  submit: { marginTop: 50 },
});
